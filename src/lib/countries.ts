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

export function getCountry(code: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.code === code)
}
