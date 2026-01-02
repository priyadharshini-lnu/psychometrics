import { useMemo } from 'react'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'

type TimezoneOption = {
  value: string
  label: string
}

export const useTimezones = (currentZone?: string): TimezoneOption[] => useMemo(() => {
  const timeZones = Intl.supportedValuesOf('timeZone')
    .map(normalizeTimeZone)
    .sort((a, b) => dayjs().tz(a).utcOffset() - dayjs().tz(b).utcOffset())
  const timezoneGuess = normalizeTimeZone(currentZone || dayjs.tz.guess())

  if (timezoneGuess) {
    _.remove(timeZones, zone => zone === timezoneGuess)
    timeZones.unshift(timezoneGuess)
  }

  const timezoneOptions: TimezoneOption[] = timeZones.map(zone => ({
    value: zone,
    label: `(GMT${dayjs().tz(zone).format('Z')}) ${zone}`,
  }))

  return timezoneOptions
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
