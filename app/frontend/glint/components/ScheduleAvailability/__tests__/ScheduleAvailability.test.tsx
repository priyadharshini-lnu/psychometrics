import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { ScheduleAvailability } from '~/glint'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const initialAvailability = {
  timezone: 'Asia/Baku',
  startDate: moment('26/07/2023', 'DD/MM/YYYY'),
  endDate: moment('05/08/2023', 'DD/MM/YYYY'),
  availabilityDays: [{
    day: 1,
    timeSlots: [{ startTime: moment('12:05 AM', 'hh:mm A'), endTime: moment('12:10 AM', 'hh:mm A') }],
  },
  {
    day: 5,
    timeSlots: [{ startTime: moment('12:05 AM', 'hh:mm A'), endTime: moment('12:10 AM', 'hh:mm A') }],
  }],
}

test('All days should be shown before date selection', async () => {
  render(
    <div id="container">
      <ScheduleAvailability
        id="test"
        onFormSubmit={() => null}
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
        onFormSubmit={() => null}
        initialAvailability={initialAvailability}
      />
    </div>,
  )

  expect(screen.getByText('26th July 2023 - 5th August 2023')).toBeInTheDocument()
})
