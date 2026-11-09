"""Build daily-hadith.json, featured.json (records used by summaries/daily cards),
references.json, and validate every cross-reference. Exits non-zero on any problem.
Usage: python3 -I scripts/make_extras.py <project_dir>"""
import json, os, sys, collections

P = sys.argv[1]
DB = f"{P}/database" if os.path.exists(f"{P}/database") else f"{P}/kutub-al-sittah-database"
SRC = f"{P}/src/data"
recs, idcount = {}, collections.Counter()
for c in ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']:
    for r in json.load(open(f"{DB}/{c}.json", encoding='utf-8')):
        recs[r['id']] = r
        idcount[r['id']] += 1
errors = []

# --- daily hadith: short, sahih, alignment-passed narrations that Imam an-Nawawi chose for Riyad as-Salihin
daily = [r['id'] for r in recs.values()
         if r['collection_id'] in ('bukhari', 'muslim') and r['riyad_as_salihin'] and r['translation_check'] == 'passed'
         and r['bangla_translation'] and r['arabic_text'] and 60 <= len(r['bangla_translation']) <= 330
         and r['narrator']]
# spread across collections and Riyad order for variety
daily.sort(key=lambda i: (recs[i]['riyad_as_salihin'][0]))
json.dump({"source": "ইমাম নববীর রিয়াদুস সালেহীনে উদ্ধৃত, সহিহ বুখারি ও সহিহ মুসলিমের সংক্ষিপ্ত হাদিস",
           "selection_rule": "সহিহ বুখারি/মুসলিম; রিয়াদুস সালেহীনের সাথে যাচাইকৃত; বাংলা অনুবাদের মিল যাচাই উত্তীর্ণ; সংক্ষিপ্ত",
           "hadith_ids": daily}, open(f"{SRC}/daily-hadith.json", 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# --- validate summaries
S = json.load(open(f"{SRC}/summaries.json", encoding='utf-8'))
topics = {t['id'] for t in json.load(open(f"{SRC}/topics.json", encoding='utf-8'))}
seen = set()
for s in S:
    if s['topic_id'] in seen:
        errors.append(f"duplicate summary topic {s['topic_id']}")
    seen.add(s['topic_id'])
    if s['category_id'] not in topics:
        errors.append(f"{s['topic_id']}: unknown category {s['category_id']}")
    used = set()
    for sec in ('combined_teachings', 'relationships'):
        for item in s['summary'][sec]:
            for ref in item['refs']:
                used.add(ref)
                if ref not in s['hadith_ids']:
                    errors.append(f"{s['topic_id']}: {sec} cites {ref} not listed in hadith_ids")
    for hid in s['hadith_ids']:
        r = recs.get(hid)
        if not r:
            errors.append(f"{s['topic_id']}: missing record {hid}")
            continue
        if r['authenticity'] != 'sahih':
            errors.append(f"{s['topic_id']}: {hid} is not sahih")
        if r['translation_check'] == 'flagged':
            errors.append(f"{s['topic_id']}: {hid} has a flagged translation")
        if hid not in used:
            errors.append(f"{s['topic_id']}: {hid} listed but never cited")

featured_ids = sorted(set(daily) | {h for s in S for h in s['hadith_ids']})
json.dump({i: recs[i] for i in featured_ids}, open(f"{SRC}/featured.json", 'w', encoding='utf-8'), ensure_ascii=False,
          separators=(',', ':'))

# --- Sahih Muslim: Abdul-Baqi number -> first record id (for direct lookups like "মুসলিম ৯১")
mi = {}
for r in recs.values():
    if r['collection_id'] == 'muslim':
        k = r['hadith_number']
        if k not in mi or float(r['sequence_number']) < float(recs[mi[k]]['sequence_number']):
            mi[k] = r['id']
json.dump(mi, open(f"{SRC}/muslim-index.json", 'w', encoding='utf-8'), separators=(',', ':'))

# --- references / credits
json.dump({
    "texts": [
        {"name": "hadith-api (fawazahmed0)", "url": "https://github.com/fawazahmed0/hadith-api",
         "use": "আরবি মূলপাঠ, বাংলা ও ইংরেজি অনুবাদ এবং সুনান গ্রন্থের মান (গ্রেড)"},
        {"name": "HadithBD", "url": "https://www.hadithbd.com", "use": "বাংলা অনুবাদের মূল উৎস"},
        {"name": "Sunnah.com", "url": "https://sunnah.com", "use": "নম্বর পদ্ধতি ও প্রতিটি হাদিসের উৎস-লিংক"},
        {"name": "hadith-json (AhmedBaset)", "url": "https://github.com/AhmedBaset/hadith-json",
         "use": "রিয়াদুস সালেহীনের আরবি ও ইংরেজি পাঠ (ক্রস-রেফারেন্স যাচাইয়ে ব্যবহৃত)"}
    ],
    "graders": ["Al-Albani", "Zubair Ali Zai", "Shuaib Al Arnaut", "Ahmad Muhammad Shakir", "Bashar Awad Maarouf",
                "Abu Ghuddah", "Muhammad Muhyi Al-Din Abdul Hamid", "Muhammad Fouad Abd al-Baqi"],
    "numbering": {"bukhari": "Sunnah.com / ফাতহুল বারি নম্বর", "muslim": "মুহাম্মাদ ফুয়াদ আবদুল বাকি নম্বর",
                  "others": "Sunnah.com নম্বর"}
}, open(f"{SRC}/references.json", 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# --- validate database
dups = [i for i, n in idcount.items() if n > 1]
if dups:
    errors.append(f"duplicate ids: {dups[:5]}")
for r in recs.values():
    for f in ('arabic_text', 'bangla_translation', 'english_translation'):
        if '\ufffd' in (r[f] or ''):
            errors.append(f"{r['id']}: corrupted character in {f}")
    if not r['source_url'].startswith('https://sunnah.com/'):
        errors.append(f"{r['id']}: bad source url")
    for t in r['topics']:
        if t not in topics:
            errors.append(f"{r['id']}: unknown topic {t}")
print('records', len(recs), '| daily', len(daily), '| featured', len(featured_ids), '| summaries', len(S))
if errors:
    print('\n'.join(errors[:50]))
    sys.exit(1)
print('validation: OK')
