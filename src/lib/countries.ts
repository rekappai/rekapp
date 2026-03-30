export type CountryConfig = {
  code: string
  name: string
  flag: string
  index: string
  currency: string
  active: boolean
}

export const COUNTRIES: CountryConfig[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸', index: 'S&P 500',    currency: 'USD', active: true  },
  { code: 'it', name: 'Italy',         flag: '🇮🇹', index: 'FTSE MIB',   currency: 'EUR', active: true  },
  { code: 'fr', name: 'France',        flag: '🇫🇷', index: 'CAC 40',     currency: 'EUR', active: true  },
  { code: 'gb', name: 'United Kingdom',flag: '🇬🇧', index: 'FTSE 100',   currency: 'GBP', active: false },
  { code: 'de', name: 'Germany',       flag: '🇩🇪', index: 'DAX 40',     currency: 'EUR', active: false },
  { code: 'es', name: 'Spain',         flag: '🇪🇸', index: 'IBEX 35',    currency: 'EUR', active: false },
  { code: 'br', name: 'Brazil',        flag: '🇧🇷', index: 'Bovespa',    currency: 'BRL', active: false },
  { code: 'fr', name: 'France',        flag: '🇫🇷', index: 'CAC 40',     currency: 'EUR', active: false },
  { code: 'jp', name: 'Japan',         flag: '🇯🇵', index: 'Nikkei 225', currency: 'JPY', active: false },
]

export const ACTIVE_COUNTRIES = COUNTRIES.filter(c => c.active)


export const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  us: { en: 'United States', it: 'Stati Uniti', fr: 'États-Unis' },
  it: { en: 'Italy', it: 'Italia', fr: 'Italie' },
  fr: { en: 'France', it: 'Francia', fr: 'France' },
  gb: { en: 'United Kingdom', it: 'Regno Unito', fr: 'Royaume-Uni' },
  de: { en: 'Germany', it: 'Germania', fr: 'Allemagne' },
  es: { en: 'Spain', it: 'Spagna', fr: 'Espagne' },
  br: { en: 'Brazil', it: 'Brasile', fr: 'Brésil' },
  jp: { en: 'Japan', it: 'Giappone', fr: 'Japon' },
}

export function getCountryName(code: string, lang: string): string {
  return COUNTRY_NAMES[code]?.[lang] ?? COUNTRY_NAMES[code]?.en ?? code.toUpperCase()
}

export function getCountry(code: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.code === code)
}
