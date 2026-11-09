# হাদিস জ্ঞান · Hadith Knowledge

A Bengali-first, frontend-only hadith library: all six major collections (Kutub al-Sittah,
34,229 hadith) in Arabic, Bangla and English, each with its scholarly grade, a 3D reading-room
hero, topic browsing, full-text search and cited multi-hadith summaries.

> Core philosophy: "হাদিস হবে মূল উৎস, JSON হবে জ্ঞানভান্ডার, AI হবে ব্যাখ্যার সহায়ক।"

## Run it

```bash
# 1. put the database next to the source (from kutub-al-sittah-database.zip)
mkdir -p database && unzip kutub-al-sittah-database.zip -d database
# 2. rebuild the on-demand data shards from it
python3 scripts/build_shards.py .
# 3. run or build
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/index.html (single file) + dist/data/** (JSON loaded on demand)
```

Serve `dist/` from any static host. There is no backend, database, login or API key.

## Stack

React 18 + TypeScript, Vite (single-file build), Tailwind CSS, Framer Motion,
Three.js + React Three Fiber (procedural scene, no external 3D assets), Lucide icons.
Bookmarks, reading history, theme and Arabic font size live in `localStorage`.

## Project structure

```
src/
  components/  layout · navigation · hero · hadith · summary · topics · library · ui · three-d
  pages/       Home, Topics, TopicDetails, HadithDetails, Summary, Collections,
               CollectionDetails, Search, Bookmarks, About, NotFound
  services/    hadithSearch.ts · topicEngine.ts · summaryEngine.ts · referenceResolver.ts
               dataLoader.ts · aiProvider.ts (disabled placeholder for a future model)
  hooks/       useBookmarks · useReadingHistory · useTheme · useRoute · useToast · store
  utils/       textSearch.ts · validation.ts
  data/        collections.json  topics.json  summaries.json  daily-hadith.json
               featured.json  references.json  muslim-index.json
public/data/   hadith/<collection>/<n>.json   record shards (~1.4 MB each)
               search/<collection>-<n>.json   search shards
               topics/<topic>.json            topic index
database/      <collection>.json, kutub-al-sittah.json   full combined database
scripts/       gen_data.py · align_check.py · make_extras.py · topics_config.py · find.py
```

Routes are plain hash names so links survive any static host:
`#topics`, `#topic-parents`, `#hadith-bukhari-6094`, `#summary-anger`, `#collection-muslim`.

## Record schema

```json
{
  "id": "bukhari-6094",
  "collection": "Sahih al-Bukhari",
  "book": "Good Manners and Form (Al-Adab)",
  "chapter": null,
  "hadith_number": "6094",
  "arabic_text": "…",
  "bangla_translation": "…",
  "english_translation": "…",
  "narrator": "আবদুল্লাহ (রা.)",
  "authenticity": "sahih",
  "grades": [{ "grader": "Al-Albani", "grade": "Sahih" }],
  "grading_source": "…",
  "topics": ["honesty-trust"],
  "riyad_as_salihin": [54],
  "source_url": "https://sunnah.com/bukhari:6094",
  "translation_check": "passed"
}
```

`authenticity` is one of `sahih`, `hasan`, `daif`, `rejected` (very weak / munkar / mawdu),
`athar` (statement of a Companion or Successor), `ungraded`. `chapter` is `null` because the
sources don't carry bab names, and nothing is invented to fill it.

## How the data was built and checked

1. **Texts**: Arabic, Bangla and English come from the hadith-api editions, aligned by the same
   hadith number, so all three languages in a record belong to one hadith.
2. **Grades**: Bukhari and Muslim are sahih by consensus (except the 3 records in Muslim's
   introduction, marked ungraded). For the four Sunan the primary grade is Al-Albani's; every
   other grader shipped with the source is kept in `grades`.
3. **Books** come from each source's hadith-number ranges, since `reference.book = 0` is also used
   for records with a missing reference.
4. **Corrupted letters**: 75 Arabic texts arrived with a replacement character; each was restored
   from the independent hadith-json scrape of Sunnah.com, matched on every intact fragment.
5. **Translation alignment check** (`align_check.py`): the Companion named in the Bangla must appear
   in the Arabic or English of the same record (names compared as consonant skeletons).
   About 0.9% fail and show a caution on their page (`translation_check: "flagged"`).
6. **Riyad as-Salihin cross-reference**: Nawawi's Bukhari/Muslim attributions were matched to exact
   numbers by Arabic text overlap plus narrator.
7. **Topics** are a keyword index over the English translation: a discovery aid, not proof of
   authenticity or of what a hadith is mainly about.
8. **Summaries** (`summaries.json`): 10 topics, every teaching tied to the hadith IDs it rests on.
   `make_extras.py` fails the build if a summary cites a record that is missing, not sahih, or
   alignment-flagged. They were drafted by an AI assistant from the hadith texts and are marked
   `pending_scholar_review` on the site. No live language model runs in the app.

Regenerate everything with:

```bash
python3 scripts/gen_data.py <hadith-api editions dir> <riyad work dir> .
python3 scripts/make_extras.py .
```

## Sources

- hadith-api (fawazahmed0): https://github.com/fawazahmed0/hadith-api — Arabic, Bangla, English, grades
- HadithBD: https://www.hadithbd.com — origin of the Bangla translations
- hadith-json (AhmedBaset): https://github.com/AhmedBaset/hadith-json — Riyad as-Salihin; Arabic repairs
- Sunnah.com: https://sunnah.com — numbering and per-hadith source links

## Disclaimer

The data comes from open digital editions and was checked automatically. Typing or alignment
errors can remain. Interpretive summaries are not the words of the hadith. Please have a
qualified scholar review the content before relying on it for rulings.
