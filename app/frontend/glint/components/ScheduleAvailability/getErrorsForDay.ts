import _ from 'lodash'
import { ErrorMessage } from './interfaces'

export const getErrorsForDay = (
  day: number, errorMessages: ErrorMessage | undefined,
  formValues: { [key: string]: unknown[] },
): { [key: string]: Record<string, string> } | undefined => {
  if (!errorMessages) { return }

  const daysToIndex = {}
  let lastIndexOfPreviousDay: number | undefined
  _.range(0, 7).forEach((day) => {
    if (formValues[day] && formValues[day].length) {
      if (lastIndexOfPreviousDay) {
        daysToIndex[day] = _.range(lastIndexOfPreviousDay + 1, lastIndexOfPreviousDay + 1 + formValues[day].length)
      } else {
        daysToIndex[day] = _.range(formValues[day].length)
      }
      lastIndexOfPreviousDay = daysToIndex[day]?.length ? _.last(daysToIndex[day]) : lastIndexOfPreviousDay
    }
  })
  if (!daysToIndex[day]) { return }

  const error = daysToIndex[day].reduce((acc, key, index) => {
    const dayErrorPrefix = `availabilityDays/${key}`
    const errors = _.pickBy(errorMessages, (_, pointer: string) => pointer.startsWith(dayErrorPrefix))
    acc[index] = {}
    _.each(errors, (error, pointer) => {
      if (pointer === dayErrorPrefix) {
        acc[index].base = error.title
      } else if (pointer.startsWith(dayErrorPrefix)) {
        acc[index][pointer.replace(`${dayErrorPrefix}/`, '')] = error.title
      }
    })

    return acc
  }, {})
  return error
}
