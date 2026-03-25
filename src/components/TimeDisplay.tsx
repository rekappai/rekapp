'use client'
import { useEffect, useState } from 'react'

export default function TimeDisplay({
  iso,
  format = 'time',
  className,
}: {
  iso: string
  format?: 'time' | 'datetime' | 'date' | 'date-short'
  className?: string
}) {
  const [display, setDisplay] = useState<string>('')

  useEffect(() => {
    const date = new Date(iso)
    const locale = navigator.language || 'en-GB'

    let formatted = ''
    if (format === 'time') {
      formatted = date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (format === 'datetime') {
      formatted = date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) + ', ' + date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (format === 'date') {
      formatted = date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } else if (format === 'date-short') {
      formatted = date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      })
    }
    setDisplay(formatted)
  }, [iso, format])

  // Server render: empty — hydrates on client
  // This avoids hydration mismatch
  if (!display) return <span className={className} suppressHydrationWarning />

  return <span className={className} suppressHydrationWarning>{display}</span>
}
