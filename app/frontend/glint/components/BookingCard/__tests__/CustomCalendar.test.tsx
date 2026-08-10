import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from '~/utils/dayjs'
import range from 'lodash/range'
import { act } from 'react-dom/test-utils'

import { CustomCalendar } from '~/glint/components/BookingCard/CustomCalendar'

const availableDates = ['2524-07-15T09:00:00.100+05:30', '2524-07-15T09:30:00.100+05:30'].map(date => dayjs(date))
const availableDateStrings = availableDates.map(date => date.date().toString())
const DATE_FORMAT = 'DD/MM/YYYY'

test('Should display correct month and year as per default date passed through prop', async () => {
  render(
    <div id="container">
      <CustomCalendar
        availableDates={availableDates}
        onDateSelect={() => null}
        defaultValue={availableDates[0]}
      />
    </div>,
  )
  const year = screen.getByTestId('year')
  const month = screen.getByTestId('month')
  expect(year.innerHTML).toBe(availableDates[0].year().toString())
  expect(month.innerHTML).toBe(availableDates[0].clone().format('MMM'))
})

test('Should highlight only available dates', async () => {
  render(
    <div id="container">
      <CustomCalendar
        availableDates={availableDates}
        onDateSelect={() => null}
        defaultValue={availableDates[0]}
      />
    </div>,
  )

  range(1, 32).forEach((date) => {
    const dateString = date.toString()
    const dateElement = screen.getByText(dateString)
    if (availableDateStrings.includes(dateString)) {
      expect(dateElement).toHaveClass('selectedDate')
    } else {
      expect(dateElement).not.toHaveClass('selectedDate')
    }
  })
})

test('onDateSelect to be called with correct value upon clicking available dates', async () => {
  const user = userEvent.setup()
  const handleDateSelect = vi.fn(date => date)

  render(
    <div id="container">
      <CustomCalendar
        availableDates={availableDates}
        onDateSelect={selectedDate => handleDateSelect(selectedDate?.format(DATE_FORMAT))}
        defaultValue={availableDates[0]}
      />
    </div>,
  )

  const availDateThisMonth = screen.getByText(availableDateStrings[0])

  await act(async () => {
    await user.click(availDateThisMonth)
    expect(handleDateSelect).toHaveBeenCalledWith(availableDates[0].clone().format(DATE_FORMAT))
  })
})

test('onDateSelect NOT to be called upon clicking unavailable dates', async () => {
  const user = userEvent.setup()
  const handleDateSelect = vi.fn(date => date)

  render(
    <div id="container">
      <CustomCalendar
        availableDates={availableDates}
        onDateSelect={handleDateSelect}
        defaultValue={availableDates[0]}
      />
    </div>,
  )

  const unAvailDateThisMonth = screen.getByText('2')

  await act(async () => {
    await user.click(unAvailDateThisMonth)
    expect(handleDateSelect).not.toHaveBeenCalled()
  })
})

test('Should be able to navigate to and fro between months', async () => {
  const user = userEvent.setup()
  const defaultDate = availableDates[1]
  const clonedDefaultDate = defaultDate.clone()
  const currentMonthNumber = defaultDate.month()
  const currentYear = defaultDate.year().toString()

  render(
    <div id="container">
      <CustomCalendar
        availableDates={availableDates}
        onDateSelect={() => null}
        defaultValue={defaultDate}
      />
    </div>,
  )

  const year = screen.getByTestId('year')
  const month = screen.getByTestId('month')
  const gotoNextMonthIcon = screen.getByLabelText('Go to next month')
  const gotoPrevMonthIcon= screen.getByLabelText('Go to previous month')

  // Assertions stay outside act(): the header only re-renders once the click's update is committed.
  await user.click(gotoNextMonthIcon)
  expect(month.innerHTML).toBe(clonedDefaultDate.month(currentMonthNumber + 1).format('MMM'))
  expect(year.innerHTML).toBe(currentYear)

  await user.click(gotoPrevMonthIcon)
  expect(month.innerHTML).toBe(clonedDefaultDate.month(currentMonthNumber).format('MMM'))
  expect(year.innerHTML).toBe(currentYear)
})

test('Should clear currently selected date when navigated between months', async () => {
  const user = userEvent.setup()
  const handleDateSelect = vi.fn(date => date)

  render(
    <div id="container">
      <CustomCalendar
        availableDates={availableDates}
        onDateSelect={selectedDate => handleDateSelect(selectedDate?selectedDate.format(DATE_FORMAT):selectedDate)}
        defaultValue={availableDates[0]}
      />
    </div>,
  )

  const gotoNextMonthIcon = screen.getByLabelText('Go to next month')
  const gotoPrevMonthIcon= screen.getByLabelText('Go to previous month')
  const availDateThisMonth = screen.getByText(availableDateStrings[0])

  await act(async () => {
    await user.click(availDateThisMonth)
    await user.click(gotoNextMonthIcon)
    expect(handleDateSelect).toHaveBeenCalledWith(null)
    expect(handleDateSelect).toHaveBeenCalledTimes(2)
    handleDateSelect.mockClear()

    await user.click(gotoPrevMonthIcon)
    expect(handleDateSelect).toHaveBeenCalledWith(null)
  })
})
