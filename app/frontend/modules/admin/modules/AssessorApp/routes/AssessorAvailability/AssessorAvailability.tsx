import moment from 'moment'
import { ScheduleAvailability } from '~/glint'

export const AssessorAvailability = () => {
  const initialAvailability = {
    timezone: 'Asia/Baku',
    startDate: moment(),
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

  return (
    <>
      <ScheduleAvailability
        id="2"
        onFormSubmit={() => {}}
      />
      <ScheduleAvailability
        id="1"
        onFormSubmit={() => {}}
        initialAvailability={initialAvailability}
      />
    </>
  )
}
