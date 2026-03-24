'use client'
import { createContext, useContext, useState } from 'react'

type AltSlugContextType = {
  altHref: string | null
  setAltHref: (href: string | null) => void
}

const AltSlugContext = createContext<AltSlugContextType>({
  altHref: null,
  setAltHref: () => {},
})

export function AltSlugProvider({ children }: { children: React.ReactNode }) {
  const [altHref, setAltHref] = useState<string | null>(null)
  return (
    <AltSlugContext.Provider value={{ altHref, setAltHref }}>
      {children}
    </AltSlugContext.Provider>
  )
}

export function useAltSlug() {
  return useContext(AltSlugContext)
}
