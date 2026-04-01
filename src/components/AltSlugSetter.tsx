'use client'
import { useEffect } from 'react'
import { useAltSlug } from '@/lib/AltSlugContext'

type Props = {
  href?: string
  slugMap?: Record<string, string>
}

export default function AltSlugSetter({ href, slugMap }: Props) {
  const { setAltHref, setAltSlugs } = useAltSlug()
  useEffect(() => {
    if (slugMap) setAltSlugs(slugMap)
    if (href) setAltHref(href)
    return () => {
      setAltSlugs(null)
      setAltHref(null)
    }
  }, [href, slugMap, setAltHref, setAltSlugs])
  return null
}
