import { useMemo } from 'react'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'

type TimezoneOption = {
  value: string;
  label: string;
}

export const useTimezones = (currentZone?: string): TimezoneOption[] => useMemo(() => {
  const timeZones = Intl.supportedValuesOf('timeZone')
    .sort((a, b) => dayjs().tz(a).utcOffset() - dayjs().tz(b).utcOffset())
  const timezoneGuess = currentZone || dayjs.tz.guess()

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
