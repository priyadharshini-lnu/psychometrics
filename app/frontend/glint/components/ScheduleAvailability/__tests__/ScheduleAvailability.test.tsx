import { render, screen } from '@testing-library/react'

import { ScheduleAvailability } from '~/glint'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',]
const initialAvailability = {
  timezone: 'Asia/Baku',
  startDate: '2023-07-26',
  endDate: '2023-08-05',
  availabilityDays: [
    { day: 1, startTime: '12:05 AM', endTime: '12:10 AM' },
    { day: 5,  startTime: '12:05 AM', endTime: '12:10 AM' },
  ],
}

test('All days should be shown before date selection', async () => {
  render(
    <div id="container">
      <ScheduleAvailability
        id="test"
      />
    </div>,
  )
  days.forEach((day) => {
    expect(screen.getByText(day)).toBeInTheDocument()
  })
})

test('Panel header should show the date when initialAvailability prop is passed', async () => {
  render(
    <div id="container">
      <ScheduleAvailability
        id="test"
        initialAvailability={initialAvailability}
      />
    </div>,
  )

  expect(screen.getByText('26th July 2023 - 5th August 2023')).toBeInTheDocument()
})
