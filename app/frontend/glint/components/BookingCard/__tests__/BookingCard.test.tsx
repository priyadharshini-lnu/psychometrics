import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { BookingCard } from '~/glint'
import { TIME_FORMAT } from '~/glint/components/BookingCard/TimeSlotSelection'
import dayjs from '~/utils/dayjs'


const availableDates = [{ id: 1, date: '2524-07-15T09:00:00.100+05:30' }, { id: 2, date: '2524-07-15T09:30:00.100+05:30' }].map(({ id, date }) => ({ id, date: dayjs(date) }))
const availableDateStrings = availableDates.map(({ id, date }) => date.date().toString())
const DATE_TIME_FORMAT = 'DD/MM/YYYY hh:mm a'
const timeZone = dayjs.tz.guess() || 'Asia/Calcutta'
const availableDateAsPerTimezone_one = availableDates[0].date.tz(timeZone).clone()
const availableDateAsPerTimezone_two = availableDates[1].date.tz(timeZone).clone()

test('Selectiong different timezone should update the date and time accordingly', async () => {
  const user = userEvent.setup()
  render(
    <div id="container">
      <BookingCard
        title="Title"
        description="description"
        availableDateTimes={availableDates}
        currentDateTime={null}
        onDateTimeSelection={date => date}
        questionnaireComponent={<div data-testid="questionarrie">Questions</div>}
        calendarDefaultValue={availableDates[0].date}
        bookingTimeZone={timeZone}
      />
    </div>,
  )

  const timeZoneSearchBox = screen.getByRole('combobox')
  const availDateThisMonth = screen.getByText(availableDateStrings[0])

  await waitFor(async () => {
    // select date in user's timezone
    await user.click(availDateThisMonth)
  }, { timeout: 30000 })

  let timeSlotButton1 = screen.getByText(availableDateAsPerTimezone_one.format(TIME_FORMAT))
  expect(timeSlotButton1.tagName).toBe('SPAN')
  let timeSlotButton2 = screen.getByText(availableDateAsPerTimezone_two.format(TIME_FORMAT))
  expect(timeSlotButton2.tagName).toBe('SPAN')

  await act(async () => {
    // change the timezone
    await user.click(timeZoneSearchBox)
    await user.type(timeZoneSearchBox, 'Baku')
    const option = screen.getByText('(GMT+04:00) Asia/Baku')
    option.style['pointer-events'] = 'auto'
    await user.click(option)
  })
  await waitFor(async () => {
    // select date in updated timezone
    await user.click(availDateThisMonth)
  }, { timeout: 30000 })
  timeSlotButton1 = screen.getByText('07:30 am')
  expect(timeSlotButton1.tagName).toBe('SPAN')
  timeSlotButton2 = screen.getByText('08:00 am')
  expect(timeSlotButton2.tagName).toBe('SPAN')
}, 30000)

test('User should be able to select a available time slot', async () => {
  const user = userEvent.setup()
  const dateTimeSelectionHandler = jest.fn(date => date)
  render(
    <div id="container">
      <BookingCard
        title="Title"
        description="description"
        availableDateTimes={availableDates}
        currentDateTime={null}
        onDateTimeSelection={(dateObj) => {
          dateTimeSelectionHandler(dateObj?.date?.format(DATE_TIME_FORMAT))
        }}
        questionnaireComponent={<div data-testid="questionarrie">Questions</div>}
        calendarDefaultValue={availableDates[0].date}
        bookingTimeZone={timeZone}
      />
    </div>,
  )

  const availDateThisMonth = screen.getByText(availableDateStrings[0])

  await waitFor(async () => {
    await user.click(availDateThisMonth)
    const timeSlotButton = screen.getByText(availableDateAsPerTimezone_two.format(TIME_FORMAT))
    expect(timeSlotButton.tagName).toBe('SPAN')

    await user.click(timeSlotButton)
  }, { timeout: 30000 })
  expect(dateTimeSelectionHandler).toBeCalledTimes(1)
  expect(dateTimeSelectionHandler).toHaveBeenLastCalledWith(availableDates[1].date.clone().format(DATE_TIME_FORMAT))
}, 30000)

test('Questionnaire section should be shown when currentDateTime is passed', async () => {
  const dateTimeSelectionHandler = jest.fn(date => date)
  render(
    <div id="container">
      <BookingCard
        title="Title"
        description="description"
        availableDateTimes={availableDates}
        currentDateTime={availableDates[0].date}
        onDateTimeSelection={(dateObj) => {
          dateTimeSelectionHandler(dateObj?.date?.format(DATE_TIME_FORMAT))
        }}
        questionnaireComponent={<div data-testid="questionarrie">Questions</div>}
        calendarDefaultValue={availableDates[0].date}
        bookingTimeZone={timeZone}
      />
    </div>,
  )

  const questionarrieSection = screen.getByTestId('questionarrie')
  expect(questionarrieSection).toBeInTheDocument()
})

test('Date and time-slot to be pre-selected when currentDateTime is passed', async () => {
  const dateTimeSelectionHandler = jest.fn(date => date)
  const slotToBeSelected = availableDates[0]
  render(
    <div id="container">
      <BookingCard
        title="Title"
        description="description"
        availableDateTimes={availableDates}
        currentDateTime={availableDates[0].date}
        onDateTimeSelection={(dateObj) => {
          dateTimeSelectionHandler(dateObj?.date?.format(DATE_TIME_FORMAT))
        }}
        questionnaireComponent={<div data-testid="questionarrie">Questions</div>}
        calendarDefaultValue={availableDates[0].date}
        bookingTimeZone={timeZone}
      />
    </div>,
  )

  // check if time slot is pre-selected
  const timeSlotText = screen.queryByText(slotToBeSelected.date.clone().format(TIME_FORMAT))
  expect(timeSlotText?.tagName).not.toBe('SPAN')
  const selectedDateText = screen.getByText('15th Jul,')
  expect(selectedDateText).toBeInTheDocument()
})
