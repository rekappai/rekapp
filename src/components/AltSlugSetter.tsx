'use client'
import { useEffect } from 'react'
import { useAltSlug } from '@/lib/AltSlugContext'

export default function AltSlugSetter({ href }: { href: string }) {
  const { setAltHref } = useAltSlug()
  useEffect(() => {
    setAltHref(href)
    return () => setAltHref(null)
  }, [href, setAltHref])
  return null
}
