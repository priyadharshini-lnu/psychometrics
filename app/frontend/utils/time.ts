import moment from 'moment'

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
