"""Build the Hadith Knowledge database from the six collections (Kutub al-Sittah).

Inputs  : fawazahmed0/hadith-api editions (ara/ben/eng) for six collections, aligned by
          hadith number; Riyad as-Salihin cross-check results (verified earlier).
Outputs : public/data/hadith/<c>/<k>.json   record shards (loaded on demand)
          public/data/search/<c>-<k>.json   lightweight search shards
          public/data/topics/<topic>.json   topic index (id + snippet)
          src/data/collections.json, topics.json, references.json
          database/<c>.json, database/kutub-al-sittah.json   full combined export
Usage   : python3 -I scripts/gen_data.py <fa_dir> <riyad_work_dir> <project_dir>
"""
import json, re, sys, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from topics_config import TOPICS  # noqa: E402
from align_check import check as align_ok  # noqa: E402

FA, WORK, PROJ = sys.argv[1:4]
PUB = f"{PROJ}/public/data"
SRC = f"{PROJ}/src/data"
DB = f"{PROJ}/database"
for d in (f"{PUB}/hadith", f"{PUB}/search", f"{PUB}/topics", SRC, DB):
    os.makedirs(d, exist_ok=True)

COLLS = [
    dict(id="bukhari", en="Sahih al-Bukhari", bn="সহিহ আল-বুখারি", ar="صحيح البخاري",
         author_bn="ইমাম মুহাম্মাদ ইবনু ইসমাঈল আল-বুখারি (রহ.)", died="২৫৬ হি.",
         desc_bn="কুরআনের পর সবচেয়ে বিশুদ্ধ গ্রন্থ হিসেবে সর্বজনস্বীকৃত। ইমাম বুখারি কঠোরতম শর্তে শুধু সহিহ হাদিস সংকলন করেছেন।",
         whole_sahih=True),
    dict(id="muslim", en="Sahih Muslim", bn="সহিহ মুসলিম", ar="صحيح مسلم",
         author_bn="ইমাম মুসলিম ইবনুল হাজ্জাজ আন-নিশাপুরি (রহ.)", died="২৬১ হি.",
         desc_bn="বিশুদ্ধতায় সহিহ বুখারির পরেই স্থান। একই হাদিসের বিভিন্ন সনদ এক জায়গায় সাজানোর জন্য বিখ্যাত।",
         whole_sahih=True),
    dict(id="abudawud", en="Sunan Abi Dawud", bn="সুনানে আবু দাউদ", ar="سنن أبي داود",
         author_bn="ইমাম আবু দাউদ সুলাইমান ইবনুল আশআস (রহ.)", died="২৭৫ হি.",
         desc_bn="ফিকহ ও আহকাম-সংক্রান্ত হাদিসের গুরুত্বপূর্ণ সংকলন। সহিহ, হাসান ও যঈফ সব ধরনের হাদিস রয়েছে; প্রতিটির মান আলাদাভাবে দেখানো হয়েছে।",
         whole_sahih=False),
    dict(id="tirmidhi", en="Jami` at-Tirmidhi", bn="জামে আত-তিরমিজি", ar="جامع الترمذي",
         author_bn="ইমাম আবু ঈসা মুহাম্মাদ আত-তিরমিজি (রহ.)", died="২৭৯ হি.",
         desc_bn="প্রতিটি হাদিসের মান ও ফকিহদের মত উল্লেখের জন্য বিশেষ পরিচিত। সব হাদিস সহিহ নয়; প্রতিটির মান আলাদাভাবে দেখানো হয়েছে।",
         whole_sahih=False),
    dict(id="nasai", en="Sunan an-Nasa'i", bn="সুনানে নাসাঈ", ar="سنن النسائي",
         author_bn="ইমাম আহমাদ ইবনু শুআইব আন-নাসাঈ (রহ.)", died="৩০৩ হি.",
         desc_bn="সুনান গ্রন্থগুলোর মধ্যে যঈফ বর্ণনা তুলনামূলক কম। তবু প্রতিটি হাদিসের মান আলাদাভাবে দেখানো হয়েছে।",
         whole_sahih=False),
    dict(id="ibnmajah", en="Sunan Ibn Majah", bn="সুনানে ইবনে মাজাহ", ar="سنن ابن ماجه",
         author_bn="ইমাম মুহাম্মাদ ইবনু ইয়াজিদ ইবনু মাজাহ (রহ.)", died="২৭৩ হি.",
         desc_bn="ছয়টি প্রধান গ্রন্থের একটি। এতে যঈফ এবং কিছু মাওযু (জাল) বর্ণনাও রয়েছে, যা মুহাদ্দিসগণ চিহ্নিত করেছেন; প্রতিটির মান দেখানো হয়েছে।",
         whole_sahih=False),
]

DIR = re.compile('[​-‏‪-‮﻿]')
BN_DIGITS = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')


def ws(s):
    return re.sub(r'\s+', ' ', DIR.sub('', s or '')).strip()


# ---------------- grades ----------------
GRADE_BN = {"sahih": "সহিহ", "hasan": "হাসান", "daif": "যঈফ (দুর্বল)", "rejected": "অত্যন্ত দুর্বল / জাল",
            "athar": "সাহাবি/তাবেয়ির উক্তি", "ungraded": "মান উল্লেখ নেই"}


def grade_category(g):
    g = g.lower()
    if re.search(r'mawdu|maudu|fabricat|munkar|very da', g):
        return 'rejected'
    if re.search(r'da.?if|da.?eef|shadh|weak', g):
        return 'daif'
    if re.search(r'maqtu|mauquf|muquf|mawquf', g):
        return 'athar'
    if re.search(r'sahih|mutawatir', g):
        return 'sahih'
    if re.search(r'hasan', g):
        return 'hasan'
    return 'ungraded'


# ---------------- text cleaning ----------------
REFWORDS = re.compile(r'প্রকাশনী|ফাউন্ডেশন|সেন্টার|হাঃ|তাহকীক|আলবানী|ইরওয়া|সহীহাহ|মিশকাত|বুখারী[ঃ:]|মুসলিম[ঃ:]|আহমাদ \d|আহমাদ [০-৯]')


def clean_bn(t, cid, num):
    t = ws(t)
    if not t:
        return None
    if cid == 'bukhari':  # may start with the chapter heading, then "N. <hadith>"
        bnum = str(int(float(num))).translate(BN_DIGITS)
        m = re.search(rf'(?:^|\s){bnum}\s*[\.।]\s', t)
        if m and m.start() < len(t) * 0.7:
            t = t[m.end():]
        t = re.sub(r'^[؀-ۿ\s\(\)\.،؛:"\-]+(?=[ঀ-৿‘\'])', '', t)
    t = re.sub(r'^[।\.\s]+', '', t)
    t = re.sub(r'\[\d+\]', '', t)
    # publisher cross-references inside the text, e.g. "(আধুনিক প্রকাশনী- ৫৫৮২, ইসলামিক ফাউন্ডেশন- ৫৪৭৮)"
    t = re.sub(r'\(?\s*আধুনিক প্রকাশনী[^)\]]*?(?:ইসলামিক ফাউন্ডেশন[^)\]]*?)?\)', '', t)
    t = re.sub(r'\s*আধুনিক প্রকাশনী-?\s*[০-৯]+,?\s*(?:ইসলামিক ফাউন্ডেশন-?\s*[০-৯]*)?\s*$', '', t)
    t = re.sub(r'\[(?:[^\[\]]*(?:মুসলিম|বুখারী|আহমাদ|হাঃ)[^\[\]]*)\]', '', t)
    for _ in range(8):
        m = re.search(r'[\(\[]([^\(\)\[\]]*)[\)\]]\s*[\.।]?\s*$', t)
        if not m:
            break
        inner = m.group(1)
        if REFWORDS.search(inner) or re.fullmatch(r'[\s০-৯0-9,/\-–:;]+', inner) or \
                re.search(r'(মুসলিম|বুখারী|তিরমিযী|নাসাঈ|দাউদ|মাজাহ|আহমাদ)\s*[০-৯0-9]', inner):
            t = t[:m.start()].rstrip()
        else:
            break
    return ws(t) or None


SAHABI = r'\((?:রাঃ|রাযিঃ|রাযি\.|রা\.|রাদি\.|রাযিয়াল্লাহু আনহু|রাদিয়াল্লাহু আনহু)\)'


def narrator_bn(t):
    if not t:
        return None
    part = re.split(r'\.{3,}|…', t)[-1] if re.search(r'\.{3,}|…', t[:250]) else t
    m = re.search(r'([^\.।,;:()\"“”]{2,45}?)\s*' + SAHABI, part[:300])
    if not m:
        return None
    name = ws(m.group(1))
    for _ in range(3):
        name = re.sub(r'^(তিনি|এবং|ও|আর|যে|হতে|থেকে|বলেনঃ?|বলেছেনঃ?|বর্ণিত|আমি|আমরা|বছর|তাঁর|তার|তখন|এ|এই|সে)\s+', '', name)
    name = re.sub(r'^\S+-এর\s+', '', name).strip("‘’' ")
    if re.search(r'ল্লাহু|আলাইহি|ওয়াসাল্লাম', name):
        name = re.split(r'\sএর\s', name)[-1].replace('সহধর্মিণী', '').strip()
    if len(name) < 2 or len(name.split()) > 6:
        return None
    return name + ' (রা.)'


def narrator_en(t):
    t = ws(t)
    for p in (r'^Narrated ([^:]{2,60}):', r'^It was narrated (?:from|that) ([A-Z][^,:]{2,50}?) (?:said|that|narrated|who)',
              r'^([A-Z][\w\'` \-]{2,40}?) (?:reported|narrated)', r'on the authority of ([A-Z][\w\'` \-]{2,40}?)[,: ]'):
        m = re.search(p, t)
        if m:
            n = m.group(1).strip()
            if re.match(r'^(This|It|He|She|They|The|A|An|We|I)\b', n):
                return None
            return n
    return None


# ---------------- topic tagging ----------------
TOPIC_RX = {t['id']: re.compile(r'\b(?:' + '|'.join(t['kw']) + r')\b', re.I) for t in TOPICS}


def tag(en):
    if not en:
        return []
    return [tid for tid, rx in TOPIC_RX.items() if rx.search(en)]


# ---------------- Riyad as-Salihin cross references (verified earlier) ----------------
riyad = collections.defaultdict(list)
sel = json.load(open(f"{WORK}/selected.json"))['chosen']
for r in sel:
    for n, v in r['verified'].items():
        riyad[(n, float(v['hadithnumber']))].append(r['riyad'])


def num_str(x):
    f = float(x)
    return str(int(f)) if f == int(f) else str(x)


def rid(cid, num):
    return f"{cid}-{num_str(num).replace('.', '-')}"


# Arabic texts that arrive with a corrupted letter (U+FFFD) are replaced by the same hadith from the
# independent hadith-json scrape of Sunnah.com, matched on every intact fragment of the text.
try:
    ARABIC_FIXES = json.load(open(f"{WORK}/arabic_fixes.json"))
except FileNotFoundError:
    ARABIC_FIXES = {}

SHARD_BYTES = 1_400_000
SEARCH_BYTES = 2_400_000
manifest = []
topic_index = collections.defaultdict(list)
grade_counts_all = collections.Counter()
full_export = []

for C in COLLS:
    cid = C['id']
    E = {l: json.load(open(f"{FA}/{l}-{cid}.json")) for l in ('ara', 'ben', 'eng')}
    sections = E['eng']['metadata']['sections']
    # Book is taken from the source's own hadith-number ranges; reference.book is 0 both for a real
    # introduction and for records whose reference is missing, so it cannot be trusted alone.
    ranges = [(int(k), v['hadithnumber_first'], v['hadithnumber_last'])
              for k, v in E['eng']['metadata']['section_details'].items()
              if not (v['hadithnumber_first'] == 0 and v['hadithnumber_last'] == 0)]

    def book_of(num, fallback):
        for k, lo, hi in ranges:
            if lo <= float(num) <= hi:
                return k
        return fallback
    recs = []
    for a, b, e in zip(E['ara']['hadiths'], E['ben']['hadiths'], E['eng']['hadiths']):
        ar, bn_raw, en = ws(a['text']), b['text'], ws(e['text'])
        if '\ufffd' in ar:
            ar = ws(ARABIC_FIXES.get(f"{cid}:{a['hadithnumber']}", ''))
            if not ar or '\ufffd' in ar:
                raise SystemExit(f"unrecoverable Arabic text {cid}:{a['hadithnumber']}")
        bn_raw, en = bn_raw.replace('\ufffd', ''), en.replace('\ufffd', '')
        if not (ar or ws(bn_raw) or en):
            continue
        num = a['hadithnumber']
        bn = clean_bn(bn_raw, cid, num)
        bookno = book_of(a['hadithnumber'], a['reference']['book'])
        grades = [dict(grader=g['name'], grade=g['grade'].strip()) for g in (e.get('grades') or a.get('grades') or [])]
        if C['whole_sahih'] and cid == 'muslim' and bookno == 0:
            # Imam Muslim's introduction (muqaddimah) is not held to the conditions of the main body
            cat = 'ungraded'
            gsrc = "সহিহ মুসলিমের ভূমিকা (মুকাদ্দিমা): মূল অংশের সহিহ শর্তে সংকলিত নয়, তাই আলাদা মান দেওয়া হয়নি"
        elif C['whole_sahih']:
            cat = 'sahih'
            gsrc = f"{C['en']} — সংকলনভুক্ত হওয়ায় মুহাদ্দিসগণের সর্বসম্মত মতে সহিহ"
        else:
            primary = next((g for g in grades if g['grader'] == 'Al-Albani'), grades[0] if grades else None)
            cat = grade_category(primary['grade']) if primary else 'ungraded'
            gsrc = f"{primary['grader']}: {primary['grade']}" if primary else "উৎসে মান উল্লেখ নেই"
        grade_counts_all[(cid, cat)] += 1
        disp = num_str(num)
        if cid == 'muslim' and a.get('arabicnumber'):
            disp = str(int(float(a['arabicnumber'])))  # Fuad Abdul-Baqi numbering
        url_num = disp if cid == 'muslim' else str(int(float(num)))
        rec = {
            "id": rid(cid, num),
            "collection": C['en'],
            "collection_id": cid,
            "book": sections.get(str(bookno), ''),
            "book_number": bookno,
            "book_hadith_number": a['reference'].get('hadith') or None,
            "chapter": None,
            "hadith_number": disp,
            "sequence_number": num_str(num),
            "arabic_text": ar or None,
            "bangla_translation": bn,
            "english_translation": en or None,
            "narrator": narrator_bn(bn),
            "narrator_en": narrator_en(en),
            "authenticity": cat,
            "authenticity_bn": GRADE_BN[cat],
            "grades": grades,
            "grading_source": gsrc,
            "topics": tag(en),
            "riyad_as_salihin": sorted(set(riyad.get((cid, float(num)), []))),
            "source_url": f"https://sunnah.com/{cid}:{url_num}",
        }
        ok = align_ok(rec)
        rec["translation_check"] = "not_checked" if ok is None else ("passed" if ok else "flagged")
        recs.append(rec)
        full_export.append(rec)
        for t in rec['topics']:
            topic_index[t].append([rec['id'], cid, disp, cat, rec['narrator'], (bn or en or '')[:140]])

    # shards
    shards, cur, size = [], [], 0
    for r in recs:
        s = len(json.dumps(r, ensure_ascii=False).encode())
        if cur and size + s > SHARD_BYTES:
            shards.append(cur); cur, size = [], 0
        cur.append(r); size += s
    if cur:
        shards.append(cur)
    os.makedirs(f"{PUB}/hadith/{cid}", exist_ok=True)
    shard_meta = []
    for k, sh in enumerate(shards):
        json.dump(sh, open(f"{PUB}/hadith/{cid}/{k}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
        shard_meta.append(dict(file=f"data/hadith/{cid}/{k}.json", first=float(sh[0]['sequence_number']),
                               last=float(sh[-1]['sequence_number']), count=len(sh)))
    # search shards: id, normalised bangla, english lowercase, display number, grade
    ss, cur, size = [], [], 0
    for r in recs:
        row = [r['id'], r['hadith_number'], r['authenticity'], (r['bangla_translation'] or ''),
               (r['english_translation'] or '').lower()]
        s = len(json.dumps(row, ensure_ascii=False).encode())
        if cur and size + s > SEARCH_BYTES:
            ss.append(cur); cur, size = [], 0
        cur.append(row); size += s
    if cur:
        ss.append(cur)
    search_files = []
    for k, sh in enumerate(ss):
        fn = f"data/search/{cid}-{k}.json"
        json.dump(sh, open(f"{PROJ}/public/{fn}", 'w'), ensure_ascii=False, separators=(',', ':'))
        search_files.append(dict(file=fn, bytes=os.path.getsize(f"{PROJ}/public/{fn}")))
    # books
    books = collections.OrderedDict()
    for r in recs:
        b = books.setdefault(r['book_number'], dict(number=r['book_number'], name=r['book'], count=0,
                                                    first=float(r['sequence_number'])))
        b['count'] += 1
    gc = {cat: grade_counts_all[(cid, cat)] for cat in GRADE_BN if grade_counts_all[(cid, cat)]}
    manifest.append(dict({k: v for k, v in C.items()}, count=len(recs), grade_counts=gc,
                         books=list(books.values()), shards=shard_meta, search=search_files))
    json.dump(recs, open(f"{DB}/{cid}.json", 'w'), ensure_ascii=False, indent=1)
    print(cid, len(recs), 'shards', len(shards), 'search', len(ss), gc)

json.dump(full_export, open(f"{DB}/kutub-al-sittah.json", 'w'), ensure_ascii=False, separators=(',', ':'))

# topic index files
topics_meta = []
for t in TOPICS:
    rows = topic_index[t['id']]
    json.dump(rows, open(f"{PUB}/topics/{t['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    gc = collections.Counter(r[3] for r in rows)
    topics_meta.append(dict(id=t['id'], title=t['bn'], title_en=t['en'], icon=t['icon'], description=t['desc'],
                            keywords=t['kw'], count=len(rows), sahih_count=gc.get('sahih', 0),
                            file=f"data/topics/{t['id']}.json"))
json.dump(topics_meta, open(f"{SRC}/topics.json", 'w'), ensure_ascii=False, indent=1)
json.dump(manifest, open(f"{SRC}/collections.json", 'w'), ensure_ascii=False, indent=1)
print('total', len(full_export))
