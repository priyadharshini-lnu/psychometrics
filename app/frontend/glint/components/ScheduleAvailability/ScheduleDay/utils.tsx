import moment from 'moment/moment'
import { FormInstance } from 'antd'
import _ from 'lodash'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getDefaultTimesFromPreviousDays = (currentIndex, formInstance: FormInstance,
  add: (defaultValue?: any, insertIndex?: number) => void) => {
  let previousIndex = (currentIndex - 1)
  let foundPreviousDay = false
  while (previousIndex >= 0) {
    const previousDay = formInstance.getFieldValue(previousIndex.toString())
    if (previousDay) {
      add(previousDay[0])
      foundPreviousDay = true
      break
    }
    previousIndex -= 1
  }

  if (!foundPreviousDay) {
    add({
      startTime: moment('9:00:00', 'HH:mm:ss'),
      endTime: moment('17:00:00', 'HH:mm:ss'),
    })
  }
}

export const allMinutes = _.range(0, 60, 5)

const allHours = _.range(0, 24)

type DisbledHoursData = {
  disabledHours: number[]
  disabledMins: number[]
  startTimeHour?: number
}
export const getDisabledHourDataForEndTime = (fieldDataIndex: number, fieldData):DisbledHoursData => {
  const startTime = fieldData[fieldDataIndex]?.startTime
  if (!startTime) {
    return { disabledHours: [], disabledMins: [] }
  }

  const startTimeHour = startTime?.hour()
  const startTimeMinutes = startTime?.minutes()
  const disabledHours = allHours.filter(hour => hour < startTimeHour)
  const disabledMins = allMinutes.filter(minutes => minutes <= startTimeMinutes)
  return ({ disabledHours, disabledMins, startTimeHour })
}
