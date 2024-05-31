import { render, screen, waitFor } from '@testing-library/react'
import dayjs from '~/utils/dayjs'

import { DateTimeWithZone } from '~/glint'

const gmtOffsetString = dayjs().format('(z)')
const dateTimeString = "2024-05-31T05:00:00.000+04:00"

describe('Correct date and time is shown ', () => {
  test('with default format', async () => {
    const expectedDateTime = "31st May 2024, 5:00 am"
    render(
      <div id="container">
        <DateTimeWithZone dateString={dateTimeString} />
      </div>,
    )

    const dateTimeElement = screen.getByText(expectedDateTime)
    const gmtOffsetElement = screen.getByText(gmtOffsetString)

    expect(dateTimeElement).toBeInTheDocument()
    expect(gmtOffsetElement).toBeInTheDocument()
  })

  test('with custom format', async () => {
    const expectedDateTime = "May 31, 2024 5:00 AM"
    render(
      <div id="container">
        <DateTimeWithZone dateString={dateTimeString} format="lll"/>
      </div>,
    )

    const dateTimeElement = screen.getByText(expectedDateTime)
    const gmtOffsetElement = screen.getByText(gmtOffsetString)

    expect(dateTimeElement).toBeInTheDocument()
    expect(gmtOffsetElement).toBeInTheDocument()
  })
})
