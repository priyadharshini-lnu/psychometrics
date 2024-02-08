import dayjs from '~/utils/dayjs'

export const dateFormat = 'Do MMMM YYYY, h:mm a'

export const formatWorkshopDate = (date: string | dayjs.Dayjs) => (
  dayjs(date).format('Do MMM YYYY, h:mm a')
)
