"""Cross-language alignment check: does the narrator named in the Bangla translation appear
in the Arabic text of the same record? Names are reduced to a consonant skeleton shared by
Arabic and Bangla script (vowels and weak letters dropped, similar sounds merged).

Usage: python3 -I scripts/align_check.py <database_dir>  -> writes <database_dir>/alignment.json
"""
import json, re, sys

HAR = re.compile('[ً-ْٰـ]')
AR = {'ب': 'b', 'ت': 't', 'ط': 't', 'ث': 's', 'س': 's', 'ص': 's', 'ش': 's', 'ج': 'j', 'ز': 'j', 'ذ': 'j',
      'ض': 'j', 'ظ': 'j', 'ح': 'h', 'ه': 'h', 'ة': 'h', 'خ': 'k', 'ق': 'k', 'ك': 'k', 'د': 'd', 'ر': 'r',
      'غ': 'g', 'ف': 'f', 'ل': 'l', 'م': 'm', 'ن': 'n'}
BN = {'ক': 'k', 'খ': 'k', 'গ': 'g', 'ঘ': 'g', 'চ': 's', 'ছ': 's', 'জ': 'j', 'ঝ': 'j', 'য': 'j', 'ট': 't',
      'ঠ': 't', 'ত': 't', 'থ': 's', 'ৎ': 't', 'ড': 'd', 'ঢ': 'd', 'দ': 'd', 'ধ': 'd', 'ণ': 'n', 'ন': 'n',
      'ঞ': 'n', 'ং': 'n', 'প': 'f', 'ফ': 'f', 'ব': 'b', 'ভ': 'b', 'ম': 'm', 'র': 'r', 'ড়': 'r', 'ঢ়': 'r',
      'ল': 'l', 'শ': 's', 'ষ': 's', 'স': 's', 'হ': 'h'}
GENERIC_BN = {'ইবনু', 'ইবন', 'ইবনে', 'ইবনুল', 'বিন', 'বিনতু', 'বিনত', 'আবূ', 'আবু', 'উম্মু', 'উম্মে', 'রা.', 'আল', 'আল-',
              'হতে', 'থেকে', 'তিনি', 'আব্দুল্লাহ', 'আবদুল্লাহ', 'আবদুল্লাহ্', 'আব্দুল্লাহ্', "'আবদুল্লাহ", '‘আবদুল্লাহ', 'রাসূলুল্লাহ'}


def dedup(s):
    return re.sub(r'(.)\1+', r'\1', s)


def sk_ar(w):
    w = re.sub(r'^(وال|فال|بال|لل|ال)', '', w)
    s = dedup(''.join(AR.get(ch, '') for ch in w))
    return s[:-1] if s.endswith('h') and len(s) > 2 else s


def sk_en(w):
    w = w.lower()
    for a, b in (('th', 's'), ('sh', 's'), ('dh', 'j'), ('kh', 'k'), ('gh', 'g'), ('ph', 'f')):
        w = w.replace(a, b)
    m = {'b': 'b', 't': 't', 'j': 'j', 'z': 'j', 'h': 'h', 'q': 'k', 'k': 'k', 'c': 'k', 'd': 'd', 'r': 'r',
         's': 's', 'g': 'g', 'f': 'f', 'l': 'l', 'm': 'm', 'n': 'n'}
    s = dedup(''.join(m.get(ch, '') for ch in w))
    return s[:-1] if s.endswith('h') and len(s) > 2 else s


def en_words(t):
    return {sk_en(w) for w in re.findall(r"[A-Za-z]+", (t or '').replace("'", '').replace('`', '').replace('’', ''))}


def sk_bn(w):
    w = re.sub(r'^আল-?', '', w)
    w = w.replace('্য', '').replace('্ব', '').replace('য়', '')  # ya-/ba-phala and antastha-y are glides
    s = dedup(''.join(BN.get(ch, '') for ch in w))
    return s[:-1] if s.endswith('h') and len(s) > 2 else s


def ar_words(t):
    t = HAR.sub('', t or '')
    t = re.sub('[إأآٱ]', 'ا', t)
    return {sk_ar(w) for w in re.findall(r'[ء-ي]+', t)}


def check(rec):
    nar = rec.get('narrator')
    if not nar or not rec.get('arabic_text'):
        return None
    toks = [t.strip("‘’'\"-().") for t in nar.replace('(রা.)', '').split()]
    toks = [t for t in toks if t and t not in GENERIC_BN]
    sks = [sk_bn(t) for t in toks]
    sks = [s for s in sks if len(s) >= 2]
    if not sks:
        return None
    aw = ar_words(rec['arabic_text'])
    # Arabic words may carry attached prepositions/conjunctions (و ف ب ل ك), so allow a suffix match
    if any(s == w or (len(w) - len(s) <= 1 and w.endswith(s)) for s in sks for w in aw):
        return True
    # Ibn Mas'ud is usually just "Abdullah" in Kufan chains
    if any(s == 'msd' for s in sks) and re.search('عبد الله', HAR.sub('', rec['arabic_text'])):
        return True
    # independent second witness: the English translation of the same record
    ew = en_words(rec.get('english_translation'))
    return any(s in ew for s in sks)


def main():
  out = {}
  for c in ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']:
    R = json.load(open(f"{DB}/{c}.json"))
    bad, chk = [], 0
    for r in R:
        v = check(r)
        if v is None:
            continue
        chk += 1
        if not v:
            bad.append(r['id'])
    out[c] = dict(checked=chk, flagged=bad)
    print(c, 'checked', chk, 'flagged', len(bad), f"{len(bad)/max(chk,1):.2%}")
  json.dump(out, open(f"{DB}/alignment.json", 'w'), indent=1)


if __name__ == '__main__':
    DB = sys.argv[1]
    main()
