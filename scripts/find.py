"""Find candidate hadith for summaries. Usage: find.py <db_dir> <regex> [colls] [limit]"""
import json, re, sys

DB, rx = sys.argv[1], re.compile(sys.argv[2], re.I)
colls = (sys.argv[3] if len(sys.argv) > 3 else 'bukhari,muslim').split(',')
lim = int(sys.argv[4]) if len(sys.argv) > 4 else 6
for c in colls:
    n = 0
    for r in json.load(open(f"{DB}/{c}.json")):
        en = r['english_translation'] or ''
        if rx.search(en) and r['authenticity'] in ('sahih', 'hasan') and r['translation_check'] != 'flagged':
            print(f"{r['id']:16} [{r['authenticity']},{r['translation_check'][0]}] {len(en):4} {en[:230]}")
            n += 1
            if n >= lim:
                break
