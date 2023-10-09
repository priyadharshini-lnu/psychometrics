import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { CountdownTimer } from '~/glint'

const extraSeconds = 3
const onlySecondsFormatMatcher = /^\d+s$/
const minutesFormatMatcher = /^\d+m\s+\d+s$/
const hoursFormatMatcher = /^\d+h\s+\d+m\s+\d+s$/
const daysFormatMatcher = /^\d+d\s+\d+h\s+\d+m\s+\d+s$/
const minuteInSecs = 60
const hourInSecs = 60 * minuteInSecs
const dayInSecs = 24 * hourInSecs

describe('CountdownTimer shows time in proper format when', () => {
  test('time provided is less than a minute', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={10}
        />
      </div>,
    )
    const timeShown = screen.getByText(onlySecondsFormatMatcher)
    expect(timeShown).toBeInTheDocument()
  })

  test('time provided is more than a minute', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={minuteInSecs + 30}
        />
      </div>,
    )
    const timeShown = screen.getByText(minutesFormatMatcher)
    expect(timeShown).toBeInTheDocument()
  })

  test('time provided is more than a hour', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={hourInSecs + 30}
        />
      </div>,
    )
    const timeShown = screen.getByText(hoursFormatMatcher)
    expect(timeShown).toBeInTheDocument()
  })

  test('time provided is more than a day', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={dayInSecs + 30}
        />
      </div>,
    )
    const timeShown = screen.getByText(daysFormatMatcher)
    expect(timeShown).toBeInTheDocument()
  })
})

describe('CountdownTimer format should change when', () => {
  test('time goes below a minute', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={minuteInSecs + extraSeconds}
        />
      </div>,
    )
    const timeShown = screen.getByText(minutesFormatMatcher)
    expect(timeShown).toBeInTheDocument()

    await act(async () => {
      await new Promise(r => setTimeout(r, (extraSeconds + 1) * 1000))
    })

    expect(timeShown.innerHTML).toMatch(onlySecondsFormatMatcher)
  })

  test('time goes below an hour', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={hourInSecs + extraSeconds}
        />
      </div>,
    )
    const timeShown = screen.getByText(hoursFormatMatcher)
    expect(timeShown).toBeInTheDocument()

    await act(async () => {
      await new Promise(r => setTimeout(r, (extraSeconds + 1) * 1000))
    })

    expect(timeShown.innerHTML).toMatch(minutesFormatMatcher)
  })

  test('time goes becomes less than a day', async () => {
    render(
      <div id="container">
        <CountdownTimer
          seconds={dayInSecs + extraSeconds}
        />
      </div>,
    )
    const timeShown = screen.getByText(daysFormatMatcher)
    expect(timeShown).toBeInTheDocument()

    await act(async () => {
      await new Promise(r => setTimeout(r, (extraSeconds + 1) * 1000))
    })

    expect(timeShown.innerHTML).toMatch(hoursFormatMatcher)
  })
})
