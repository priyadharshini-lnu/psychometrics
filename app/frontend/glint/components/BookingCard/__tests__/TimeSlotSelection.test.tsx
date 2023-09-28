import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment-timezone'
import mediaQuery from 'css-mediaquery'

import { TimeSlotSelection, TIME_FORMAT } from '~/glint/components/BookingCard/TimeSlotSelection'
import { GlintProvider } from '~/glint'

const dateTimeFormatString = 'DD/MM/YYYY hh:mm A'
const availableSlots = [{id: 1, date:'2023-07-15T09:00:00.100+05:30'}, {id:2, date:'2023-07-15T09:30:00.100+05:30'}].map(({id, date}) => ({id, date:moment(date)}))
const slotToBeSelected = availableSlots[1].date

function createMatchMedia (width) {
  return query => ({
    matches: mediaQuery.match(query, { width }),
    media: '',
    addListener: () => {},
    removeListener: () => {},
    onchange: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  })
}

function resizeScreenSize (width) {
  window.matchMedia = createMatchMedia(width)
}

test('Selecting timeslot calls onTimeSelection handler with proper value', async () => {
  const expectedDateTime = slotToBeSelected.clone().format(dateTimeFormatString)
  let selectedDateTime = ''
  const handleTimeZoneChange = (dateObj) => {
    selectedDateTime = dateObj.date.format(dateTimeFormatString)
  }

  render(
    <div id="container">
      <TimeSlotSelection
        availableSlots={availableSlots}
        selectedDate={availableSlots[0].date}
        selectedDateTime={null}
        onTimeSelection={handleTimeZoneChange}
        onCancelDateSelection={() => null}
        questionnaireComponent={<>Questions</>}
      />
    </div>,
  )
  const timeSlotButton = screen.queryByText(slotToBeSelected.clone().format(TIME_FORMAT))
  expect(timeSlotButton?.tagName).toBe('SPAN')

  await waitFor(async () => {
    timeSlotButton && await userEvent.click(timeSlotButton)
  })
  expect(selectedDateTime).toBe(expectedDateTime)
})

test('Selected time should be displayed on top', async () => {
  const expectedTimeText = slotToBeSelected.clone().format(TIME_FORMAT)

  render(
    <div id="container">
      <TimeSlotSelection
        availableSlots={availableSlots}
        selectedDate={availableSlots[0].date}
        selectedDateTime={slotToBeSelected}
        onTimeSelection={() => null}
        onCancelDateSelection={() => null}
        questionnaireComponent={<>Questions</>}
      />
    </div>,
  )
  const selectedTimeDisplay = screen.getByTestId('selected-time')
  expect(selectedTimeDisplay.innerHTML).toBe(expectedTimeText)
})

test('On Desktop - Back icon should be shown only after a time-slot is selected and clicking on it executes the callback', async () => {
  const handleTimeSelection = jest.fn(date => date)

  render(
    <div id="container">
      <TimeSlotSelection
        availableSlots={availableSlots}
        selectedDate={availableSlots[0].date}
        selectedDateTime={slotToBeSelected}
        onTimeSelection={handleTimeSelection}
        onCancelDateSelection={() => null}
        questionnaireComponent={<>Questions</>}
      />
    </div>,
  )
  const timeSlotText = screen.queryByText(slotToBeSelected.clone().format(TIME_FORMAT))
  expect(timeSlotText?.tagName).not.toBe('SPAN')

  const backButton = screen.queryByTestId('back-icon')
  expect(backButton).toBeInTheDocument()

  await waitFor(async () => {
    backButton && await userEvent.click(backButton)
  })
  expect(handleTimeSelection).toBeCalledWith(null)
})

test('On Mobile - Back icon should be shown before selecting a time-slot', async () => {
  const handleTimeSelection = jest.fn(date => date)
  resizeScreenSize(400)

  render(
    <div id="container">
      <GlintProvider>
        <TimeSlotSelection
          availableSlots={availableSlots}
          selectedDate={availableSlots[0].date}
          selectedDateTime={null}
          onTimeSelection={handleTimeSelection}
          onCancelDateSelection={() => null}
          questionnaireComponent={<>Questions</>}
        />
      </GlintProvider>
    </div>,
  )

  const timeSlotButton = screen.getByText(slotToBeSelected.clone().format(TIME_FORMAT))
  expect(timeSlotButton.tagName).toBe('SPAN')

  const backButton = screen.getByTestId('back-icon')
  expect(backButton).toBeInTheDocument()

  await waitFor(async () => {
    backButton && await userEvent.click(backButton)
  })
})

test('On Mobile - Clicking on Back icon before selecting a time-slot should call only onCancelDateSelection handler', async () => {
  const handleTimeSelection = jest.fn(date => date)
  const handleOnCancelDateSelection = jest.fn(() => null)
  resizeScreenSize(400)

  render(
    <div id="container">
      <GlintProvider>
        <TimeSlotSelection
          availableSlots={availableSlots}
          selectedDate={availableSlots[0].date}
          selectedDateTime={null}
          onTimeSelection={handleTimeSelection}
          onCancelDateSelection={handleOnCancelDateSelection}
          questionnaireComponent={<>Questions</>}
        />
      </GlintProvider>
    </div>,
  )
  const backButton = screen.getByTestId('back-icon')

  await waitFor(async () => {
    backButton && await userEvent.click(backButton)
  })
  expect(handleOnCancelDateSelection).toBeCalledTimes(1)
  expect(handleTimeSelection).toBeCalledTimes(0)
})

test('On Mobile - Clicking on Back button after selecting a time-slot should call only onTimeSelection handler', async () => {
  const handleTimeSelection = jest.fn(date => date)
  const handleOnCancelDateSelection = jest.fn(() => null)
  resizeScreenSize(400)

  render(
    <div id="container">
      <GlintProvider>
        <TimeSlotSelection
          availableSlots={availableSlots}
          selectedDate={availableSlots[0].date}
          selectedDateTime={slotToBeSelected}
          onTimeSelection={handleTimeSelection}
          onCancelDateSelection={handleOnCancelDateSelection}
          questionnaireComponent={<>Questions</>}
        />
      </GlintProvider>
    </div>,
  )

  const timeSlotText = screen.getByText(slotToBeSelected.clone().format(TIME_FORMAT))
  expect(timeSlotText.tagName).not.toBe('SPAN')

  const backButton = screen.getByTestId('back-icon')
  expect(backButton).toBeInTheDocument()

  await waitFor(async () => {
    backButton && await userEvent.click(backButton)
  })
  expect(handleOnCancelDateSelection).toBeCalledTimes(0)
  expect(handleTimeSelection).toBeCalledWith(null)
})

test('Questionnaire should be displayed only when date is selected', async () => {
  const handleTimeSelection = jest.fn(date => date)
  const handleOnCancelDateSelection = jest.fn(() => null)

  const { rerender } = render(
    <div id="container">
      <TimeSlotSelection
        availableSlots={availableSlots}
        selectedDate={availableSlots[0].date}
        selectedDateTime={null}
        onTimeSelection={handleTimeSelection}
        onCancelDateSelection={handleOnCancelDateSelection}
        questionnaireComponent={<div data-testid="questionnaire">Questions</div>}
      />
    </div>,
  )

  let questionnaireElement = screen.queryByTestId('questionnaire')
  expect(questionnaireElement).toBe(null)

  rerender(
    <div id="container">
      <TimeSlotSelection
        availableSlots={availableSlots}
        selectedDate={availableSlots[0].date}
        selectedDateTime={slotToBeSelected}
        onTimeSelection={handleTimeSelection}
        onCancelDateSelection={handleOnCancelDateSelection}
        questionnaireComponent={<div data-testid="questionnaire">Questions</div>}
      />
    </div>,
  )

  questionnaireElement = screen.queryByTestId('questionnaire')
  expect(questionnaireElement).toBeInTheDocument()
})
