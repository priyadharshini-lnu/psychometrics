import _ from 'lodash'
import { FormInstance } from 'antd'
import dayjs from '~/utils/dayjs'
import { UserAvailabilityDate, UserAvailabilityDay } from './interfaces'

const { locale } = document.body.dataset

export const parseInitialAvailability = _.memoize((initialAvailability?: UserAvailabilityDate) => {
  if (!initialAvailability) {
    return null
  }

  const sortedAvailabilityDays = _.sortBy(
    initialAvailability.availabilityDays,
    o => dayjs(o.endTime, 'hh:mm'),
  )

  const initialAvailabilityDays = sortedAvailabilityDays.reduce(
    (val, userAvailabilityDay) => {
      const { day } = userAvailabilityDay
      val[day] ||= []
      val[day].push({
        startTime: dayjs(userAvailabilityDay.startTime, 'hh:mm'),
        endTime: dayjs(userAvailabilityDay.endTime, 'hh:mm'),
      })
      return val
    },
    {} as UserAvailabilityDay<dayjs.Dayjs>,
  )

  return {
    ...initialAvailability,
    startDate: dayjs(initialAvailability.startDate),
    endDate: dayjs(initialAvailability.endDate),
    availabilityDays: initialAvailabilityDays,
  }
})

export const dayOptions = Array.from(
  { length: 7 }, (_, i) => ({
    label: dayjs().locale(locale || 'en').day(i).format('dddd')[0].toLocaleUpperCase(locale || 'en'),
    value: i,
  }),
)

export const defaultCheckedList = [1, 2, 3, 4, 5]
export const getInitialCheckedDayList = (
  formInstance: FormInstance, availabilityDays?: UserAvailabilityDay<dayjs.Dayjs>,
) => {
  const selectedDays = availabilityDays ? Object.keys(availabilityDays) : []
  if (selectedDays.length > 0) {
    return selectedDays.map(day => parseInt(day, 10))
  }
  defaultCheckedList.forEach((day) => {
    formInstance.setFieldValue(day.toString(), [{
      startTime: dayjs('09:00', 'HH:mm'),
      endTime: dayjs('17:00', 'HH:mm'),
    }])
  })
  return defaultCheckedList
}
