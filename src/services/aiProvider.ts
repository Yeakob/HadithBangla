/**
 * Optional AI integration point (disabled by default).
 *
 * The app ships with NO language model. Summaries come from reviewed-by-design JSON
 * (src/data/summaries.json) and are assembled by summaryEngine.ts. If a model is connected
 * later, it must only rephrase or explain content grounded in hadith IDs that exist in the
 * local database, and every answer must keep the interpretation notice and citations.
 */
export interface AiProvider {
  readonly name: string
  readonly enabled: boolean
  explain(input: { topic: string; hadithIds: string[] }): Promise<{ text: string; citedIds: string[] }>
}

export const disabledProvider: AiProvider = {
  name: 'none',
  enabled: false,
  async explain() {
    throw new Error('কোনো AI মডেল সংযুক্ত নেই। সারসংক্ষেপ স্থানীয় JSON থেকে দেখানো হচ্ছে।')
  },
}

export const aiProvider: AiProvider = disabledProvider
