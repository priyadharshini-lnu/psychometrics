import moment from 'moment'

export const dateFormat = 'Do MMMM YYYY, h:mm a'

export const formatWorkshopDate = (date: string | moment.Moment) => (
  moment(date).format('Do MMMM YYYY, h:mm a')
)
