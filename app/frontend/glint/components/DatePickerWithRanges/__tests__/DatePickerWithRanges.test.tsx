import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from '~/utils/dayjs'

import { DatePickerWithRanges } from '~/glint'

const today = dayjs()
const yesterday = dayjs().subtract(1, 'd')
const dateFormat = 'DD/MM/YYYY'

describe('Proper dates should be selected after ', () => {
  const user = userEvent.setup()

  test('cliking on Today', async () => {
    const expectedStartDate = today.clone().format(dateFormat)
    const expectedEndDate = expectedStartDate
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('Today')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })

  test('cliking on Yesterday', async () => {
    const expectedStartDate = yesterday.clone().format(dateFormat)
    const expectedEndDate = expectedStartDate
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('Yesterday')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })

  test('cliking on Current Week', async () => {
    const expectedStartDate = dayjs().startOf('w').clone().format(dateFormat)
    const expectedEndDate = dayjs().endOf('w').clone().format(dateFormat)
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('Current Week')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })

  test('cliking on Last Week', async () => {
    const expectedStartDate = dayjs().subtract(1, 'w').startOf('w').clone()
      .format(dateFormat)
    const expectedEndDate = dayjs().subtract(1, 'w').endOf('w').clone()
      .format(dateFormat)
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('Last Week')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })

  test('cliking on Current Month', async () => {
    const expectedStartDate = dayjs().startOf('M').clone().format(dateFormat)
    const expectedEndDate = dayjs().endOf('M').clone().format(dateFormat)
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('Current Month')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })

  test('cliking on Last Month', async () => {
    const expectedStartDate = dayjs().subtract(1, 'M').startOf('M').clone()
      .format(dateFormat)
    const expectedEndDate = dayjs().subtract(1, 'M').endOf('M').clone()
      .format(dateFormat)
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('Last Month')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })

  test('cliking on All Time', async () => {
    const expectedStartDate = dayjs().subtract(100, 'y').clone()
      .format(dateFormat)
    const expectedEndDate = dayjs().add(100, 'y').clone()
      .format(dateFormat)
    render(
      <div id="container">
        <DatePickerWithRanges format={dateFormat} />
      </div>,
    )

    const startDateInput = screen.getByPlaceholderText('Start date')
    const endDateInput = screen.getByPlaceholderText('End date')
    await waitFor(async () => {
      await user.click(startDateInput)
    })

    const todayRange = screen.getByText('All Time')
    todayRange.style['pointer-events'] = 'auto'
    await waitFor(async () => {
      await user.click(todayRange)
    })
    expect(startDateInput).toHaveDisplayValue(expectedStartDate)
    expect(endDateInput).toHaveDisplayValue(expectedEndDate)
  })
})
