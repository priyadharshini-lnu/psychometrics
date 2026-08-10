import { useMemo } from 'react'
import dayjs from '~/utils/dayjs'

type TimezoneOption = {
  value: string
  label: string
}

type ResolvedZone = TimezoneOption & { offset: number }

let cachedZones: ResolvedZone[] | null = null

const resolveZone = (zone: string): ResolvedZone | null => {
  try {
    const zoned = dayjs().tz(zone)

    return { value: zone, label: `(GMT${zoned.format('Z')}) ${zone}`, offset: zoned.utcOffset() }
  } catch {
    return null
  }
}

// Resolving 418 zones costs one Intl.DateTimeFormat build each, so do it once per session.
const getTimezoneZones = (): ResolvedZone[] => {
  if (cachedZones) return cachedZones

  const zones = Intl.supportedValuesOf('timeZone').reduce<ResolvedZone[]>((acc, rawZone) => {
    const resolved = resolveZone(normalizeTimeZone(rawZone))

    if (resolved) acc.push(resolved)

    return acc
  }, [])

  cachedZones = zones.sort((a, b) => a.offset - b.offset)

  return cachedZones
}

const toOption = ({ value, label }: ResolvedZone): TimezoneOption => ({ value, label })

export const useTimezones = (currentZone?: string): TimezoneOption[] => useMemo(() => {
  const zones = getTimezoneZones()
  const preferredZone = normalizeTimeZone(currentZone || dayjs.tz.guess())
  const index = zones.findIndex(zone => zone.value === preferredZone)

  if (index >= 0) {
    return [zones[index], ...zones.slice(0, index), ...zones.slice(index + 1)].map(toOption)
  }

  const preferred = resolveZone(preferredZone)

  return preferred ? [preferred, ...zones].map(toOption) : zones.map(toOption)
}, [currentZone])

export function normalizeTimeZone (zone: string): string {
  if (!zone) return 'Asia/Dubai'

  const aliasMap: Record<string, string> = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'Etc/UTC': 'UTC',
    'US/Eastern': 'America/New_York',
    'US/Pacific': 'America/Los_Angeles',
    'US/Central': 'America/Chicago',
    'US/Mountain': 'America/Denver',
  }

  return aliasMap[zone] || zone
}
