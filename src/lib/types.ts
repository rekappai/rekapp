export type Article = {
  id: string
  stock_id: string
  alert_id: string
  country_code: string
  lang_code: string
  headline: string
  body: string
  explainer_body: string
  meta_title: string
  meta_description: string
  meta_slug: string
  tags: string | string[]
  published: boolean
  published_at: string
  created_at: string
  stocks?: Stock
  alerts?: Alert
}

export type Stock = {
  id: string
  symbol: string
  name: string
  sector: string
  sub_industry: string
  cap_tier: 'large' | 'mid' | 'small'
  country_code: string
}

export type Alert = {
  id: string
  stock_id: string
  direction: 'up' | 'down'
  change_pct: number
  price_at_alert: number
  previous_close: number
  triggered_at: string
}

export type Language = 'en' | 'it'

export type Country = {
  code: string
  name: string
  flag: string
  index: string
  active: boolean
}

export function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
