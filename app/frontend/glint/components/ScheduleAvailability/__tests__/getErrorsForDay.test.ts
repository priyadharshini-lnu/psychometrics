import { render, screen } from '@testing-library/react'

import { getErrorsForDay } from '../getErrorsForDay'


test('converts errors to indexed errors by position of time interval in particular day', () => {
  const dayValue = { day: 1, startTime: '10:00', endTime: '12:00' }
  const errors = getErrorsForDay(
    1, // Get error for Monday (1st day) indexed by position in a form
    {
      'availabilityDays/2': { title: 'Base error for index 2' },
      'availabilityDays/2/startTime': { title: 'Start time error for index 2' },
      'availabilityDays/3/endTime': { title: 'End time error for index 3' },
    },
    // formValues have two time interval for Sunday (0th day) and Monday (1st Day)
    { 0: [dayValue, dayValue], 1: [dayValue, dayValue] }
  )

  // index of 2 in errors corresponds to 3rd time interval in a form i.e first time interval for Monday (1st day)
  expect(errors).toMatchObject({
    0: { base: 'Base error for index 2', startTime: 'Start time error for index 2' },
    1: { endTime: 'End time error for index 3' },
  })
})
