import dayjs from '~/utils/dayjs'
import { CommentUser } from './Types'


// Utility functions
export const getUserName = (user: CommentUser): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return 'Unknown User'
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = dayjs(dateString)
    const now = dayjs()
    const diffInHours = now.diff(date, 'hour')

    if (diffInHours < 24) {
      return date.fromNow()
    }

    return date.format('MMM DD, HH:mm')
  } catch {
    return dateString
  }
}
