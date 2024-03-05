import { useMemo } from 'react'
import dayjs from '~/utils/dayjs'

type TimezoneOption = {
  value: string;
  label: string;
}

export const useTimezones = (currentZone?: string): TimezoneOption[] => useMemo(() => {
  const timeZones = Intl.supportedValuesOf('timeZone')
  const timezoneOptions: TimezoneOption[] = timeZones.map(zone => ({
    value: zone,
    label: `(GMT${dayjs().tz(zone).format('Z')}) ${zone}`,
  })).sort((a, b) => dayjs().tz(a.value).utcOffset() - dayjs().tz(b.value).utcOffset())

  const timezoneGuess = currentZone || dayjs.tz.guess()
  if (timezoneGuess) {
    timezoneOptions.unshift({
      value: timezoneGuess,
      label: `(GMT${dayjs().tz(timezoneGuess).format('Z')}) ${timezoneGuess}`,
    })
  }

  return timezoneOptions
}, [currentZone])
