import { render, screen, waitFor } from '@testing-library/react'
import dayjs from '~/utils/dayjs'

import { DateTimeWithZone } from '~/glint'

const gmtOffsetString = dayjs().format('(z)')
const dateTimeString = "2024-05-31T05:00:00.000+04:00"

describe('Correct date and time is shown ', () => {
  test('with default format', async () => {
    render(
      <div id="container">
        <DateTimeWithZone dateString={dateTimeString} />
      </div>,
    )

    const yearElement = screen.getByText(/2024/)
    const monthElement = screen.getByText(/May/)
    const gmtOffsetElement = screen.getByText(gmtOffsetString)

    expect(yearElement).toBeInTheDocument()
    expect(monthElement).toBeInTheDocument()
    expect(gmtOffsetElement).toBeInTheDocument()
  })

  test('with custom format', async () => {
    const expectedDate = "05/2024"
    render(
      <div id="container">
        <DateTimeWithZone dateString={dateTimeString} format="MM/YYYY"/>
      </div>,
    )

    const dateTimeElement = screen.getByText(expectedDate)
    const gmtOffsetElement = screen.getByText(gmtOffsetString)

    expect(dateTimeElement).toBeInTheDocument()
    expect(gmtOffsetElement).toBeInTheDocument()
  })
})
