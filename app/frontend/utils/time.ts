import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { normalizeTimeZone } from '~/hooks/useTimezones'

export const SECONDS_IN_HOUR = 86400
const FORMAT = 'DD MMM YYYY / HH:mm'

const allDays = _.range(0, 7)

export const getMinutesAndSeconds = (time: number): string => (
  dayjs(time * 1000).utc().format('mm:ss')
)

export const getCountdownTime = (time: number): string => {
  let format = 'mm:ss'
  if (time >= 3600) {
    format = 'H:mm:ss'
  } else if (time < 60) {
    format = 's'
  }
  return dayjs(time * 1000).utc().format(format)
}

export const formatedDate = date => dayjs(date).format(FORMAT)

export const minutesLeft = (start: Date, durationMs: number): number => {
  const delta = +start + durationMs - Date.now()
  return (
    delta > 0 ? Math.floor(delta / 60000) : 0
  )
}

export const minutesLeftFromNow = (date: Date) => {
  const deltaTime = +new Date(date) - Date.now()
  return Math.floor(deltaTime / 60000)
}

export function secondsLeftFromNow(date: string): number;
export function secondsLeftFromNow(date: null): null;
export function secondsLeftFromNow (date: string | null) {
  if (!date) { return null }

  const deltaTime = Date.parse(date) - Date.now()
  return Math.ceil(deltaTime / 1000)
}

export const secondsToHHMMSS = (seconds: number) => new Date(seconds * 1000).toISOString().substr(11, 8)

export const convertSecondsToMMSS = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const minutesFormatted = `${minutes}`.length === 1 ? `0${minutes}` : `${minutes}`
  const secondsFormatted = `${seconds}`.length === 1 ? `0${seconds}` : `${seconds}`

  return `${minutesFormatted}:${secondsFormatted}/10:00`
}

// TODO: Generalize if possible
export const countdownAlertInMinutes = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)

  switch (minutes) {
    case 1: return '9 minutes left'
    case 5: return '5 minutes left'
    case 8: return '2 minutes left'
    case 9: return '1 minute left'
    default: return ''
  }
}
// TODO: Generalize if possible
export const countdownAlertInSeconds = (totalSeconds: number): string => {
  switch (totalSeconds) {
    case 4: return '4'
    case 8: return '8'
    default: return ''
  }
}

export const mergeDateAndTime = (
  date: dayjs.Dayjs, time: dayjs.Dayjs | null, timezone: string| undefined = undefined,
) => {
  const finalTimezone = timezone || normalizeTimeZone(dayjs.tz.guess())
  return (
    dayjs.tz(date.format('YYYY-MM-DD'), finalTimezone).set('hour',
      time?.hour() || 0).set('minute', time?.minute() || 0)
  )
}

export const getAvailableDays = (startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs): number[] => {
  const availableDays: number[] = []
  if (startDate && endDate) {
    const daysDifference = endDate.diff(startDate, 'days')
    if (daysDifference > 6) {
      return [...allDays]
    }
    for (let diff = 0; diff <= daysDifference; diff += 1) {
      availableDays.push((startDate.day() + diff) % 7)
    }
    return [...availableDays].sort()
  }
  return [...allDays]
}

export function secondsToDayHoursAndMinutes (
  seconds: number,
  dayAbbreviation: string | undefined = 'd',
  hourAbbreviation: string | undefined = 'h',
  minuteAbbreviation: string | undefined = 'm',
) {
  const duration = dayjs.duration(seconds, 'seconds')

  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()

  let formattedDaysHoursAndMinutes = ''

  if (days > 0) {
    formattedDaysHoursAndMinutes += `${days}${dayAbbreviation} `
  }

  if (hours > 0) {
    formattedDaysHoursAndMinutes += `${hours}${hourAbbreviation} `
  }

  if (minutes > 0) {
    formattedDaysHoursAndMinutes += `${minutes}${minuteAbbreviation}`
  }

  return formattedDaysHoursAndMinutes
}
