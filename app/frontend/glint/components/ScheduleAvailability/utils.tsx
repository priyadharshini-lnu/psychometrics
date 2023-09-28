import _ from 'lodash'
import moment from 'moment-timezone'
import { Moment } from 'moment'
import { FormInstance } from 'antd'
import { UserAvailabilityDate, UserAvailabilityDay } from './interfaces'

export const parseInitialAvailability = _.memoize((initialAvailability?: UserAvailabilityDate) => {
  if (!initialAvailability) {
    return null
  }

  const sortedAvailabilityDays = _.sortBy(
    initialAvailability.availabilityDays,
    o => moment(o.endTime, 'hh:mm'),
  )

  const initialAvailabilityDays = sortedAvailabilityDays.reduce(
    (val, userAvailabilityDay) => {
      const { day } = userAvailabilityDay
      val[day] ||= []
      val[day].push({
        startTime: moment(userAvailabilityDay.startTime, 'hh:mm'),
        endTime: moment(userAvailabilityDay.endTime, 'hh:mm'),
      })
      return val
    },
    {} as UserAvailabilityDay<Moment>,
  )

  return {
    ...initialAvailability,
    startDate: moment(initialAvailability.startDate),
    endDate: moment(initialAvailability.endDate),
    availabilityDays: initialAvailabilityDays,
  }
})

export const dayOptions = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
]

export const defaultCheckedList = [1, 2, 3, 4, 5]
export const getInitialCheckedDayList = (
  formInstance: FormInstance, availabilityDays?: UserAvailabilityDay<moment.Moment>,
) => {
  const selectedDays = availabilityDays ? Object.keys(availabilityDays) : []
  if (selectedDays.length > 0) {
    return selectedDays.map(day => parseInt(day, 10))
  }
  defaultCheckedList.forEach((day) => {
    formInstance.setFieldValue(day.toString(), [{
      startTime: moment('09:00', 'HH:mm'),
      endTime: moment('17:00', 'HH:mm'),
    }])
  })
  return defaultCheckedList
}
