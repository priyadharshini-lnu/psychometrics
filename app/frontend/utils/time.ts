import moment from 'moment'

const FORMAT = 'DD MMM YYYY / HH:mm'

export const getMinutesAndSeconds = (time: number): string => (
  moment(time * 1000).utc().format('mm:ss')
)

export const getCountdownTime = (time: number): string => {
  let format = 'mm:ss'
  if (time >= 3600) {
    format = 'H:mm:ss'
  } else if (time < 60) {
    format = 's'
  }
  return moment(time * 1000).utc().format(format)
}

export const formatedDate = date => moment(date).format(FORMAT)

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

export const secondsLeftFromNow = (date: Date) => {
  const deltaTime = +new Date(date) - Date.now()
  return Math.floor(deltaTime / 1000)
}
