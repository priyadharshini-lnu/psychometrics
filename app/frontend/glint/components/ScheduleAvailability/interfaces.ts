export interface UserAvailabilityDay<T = string> {
  day: number
  startTime: T
  endTime: T
}

export interface UserAvailabilityDate<T = string> {
  timezone: string
  startDate: T
  endDate: T
  availabilityDays: UserAvailabilityDay[]
}

export interface ErrorMessage {
  [key: string]: {
    title: string
  }
}
