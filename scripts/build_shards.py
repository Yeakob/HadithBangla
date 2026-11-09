"""Rebuild public/data (record shards, search shards, topic index) from database/<collection>.json.
Use this after unzipping the database next to the source: no raw editions needed.
Usage: python3 -I scripts/build_shards.py <project_dir>"""
import json, os, sys

P = sys.argv[1]
SHARD_BYTES, SEARCH_BYTES = 1_400_000, 2_400_000
os.makedirs(f"{P}/public/data/search", exist_ok=True)
os.makedirs(f"{P}/public/data/topics", exist_ok=True)
topics = json.load(open(f"{P}/src/data/topics.json", encoding="utf-8"))
rows_by_topic = {t['id']: [] for t in topics}


def chunks(items, size_of, limit):
    out, cur, size = [], [], 0
    for it in items:
        s = size_of(it)
        if cur and size + s > limit:
            out.append(cur); cur, size = [], 0
        cur.append(it); size += s
    if cur:
        out.append(cur)
    return out


blen = lambda o: len(json.dumps(o, ensure_ascii=False).encode('utf-8'))
db_dir = f"{P}/database" if os.path.exists(f"{P}/database") else f"{P}/kutub-al-sittah-database"
for c in ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']:
    recs = json.load(open(f"{db_dir}/{c}.json", encoding="utf-8"))
    os.makedirs(f"{P}/public/data/hadith/{c}", exist_ok=True)
    for k, sh in enumerate(chunks(recs, blen, SHARD_BYTES)):
        with open(f"{P}/public/data/hadith/{c}/{k}.json", 'w', encoding="utf-8") as f:
            json.dump(sh, f, ensure_ascii=False, separators=(',', ':'))
    rows = [[r['id'], r['hadith_number'], r['authenticity'], r['bangla_translation'] or '', (r['english_translation'] or '').lower()] for r in recs]
    for k, sh in enumerate(chunks(rows, blen, SEARCH_BYTES)):
        with open(f"{P}/public/data/search/{c}-{k}.json", 'w', encoding="utf-8") as f:
            json.dump(sh, f, ensure_ascii=False, separators=(',', ':'))
    for r in recs:
        for t in r['topics']:
            rows_by_topic[t].append([r['id'], c, r['hadith_number'], r['authenticity'], r['narrator'],
                                     (r['bangla_translation'] or r['english_translation'] or '')[:140]])
for t, rows in rows_by_topic.items():
    with open(f"{P}/public/data/topics/{t}.json", 'w', encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, separators=(',', ':'))
print('rebuilt public/data')
