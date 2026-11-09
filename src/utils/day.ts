import daily from '../data/daily-hadith.json'

const IDS = daily.hadith_ids as string[]

/** Computes the pseudo-random daily hadith offset based on calendar day. */
export const dayIndex = (offset = 0) => {
  const d = new Date()
  const days = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000)
  return (((days + offset) % IDS.length) + IDS.length) % IDS.length
}

