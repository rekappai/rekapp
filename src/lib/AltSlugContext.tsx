'use client'
import { createContext, useContext, useState } from 'react'

type AltSlugMap = Record<string, string>

type AltSlugContextType = {
  altSlugs: AltSlugMap | null
  setAltSlugs: (slugs: AltSlugMap | null) => void
  altHref: string | null
  setAltHref: (href: string | null) => void
}

const AltSlugContext = createContext<AltSlugContextType>({
  altSlugs: null,
  setAltSlugs: () => {},
  altHref: null,
  setAltHref: () => {},
})

export function AltSlugProvider({ children }: { children: React.ReactNode }) {
  const [altSlugs, setAltSlugs] = useState<AltSlugMap | null>(null)
  const [altHref, setAltHref] = useState<string | null>(null)
  return (
    <AltSlugContext.Provider value={{ altSlugs, setAltSlugs, altHref, setAltHref }}>
      {children}
    </AltSlugContext.Provider>
  )
}

export function useAltSlug() {
  return useContext(AltSlugContext)
}
