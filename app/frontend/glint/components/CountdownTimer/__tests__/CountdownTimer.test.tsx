import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { notification as antdNotification } from 'antd'

import { CountdownTimer } from '~/glint'
import { Notification } from '../CountdownTimer'

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

describe('CountdownTimer with safeTimer shows time in proper format when', () => {
  test('time provided is less than a minute', () => {
    render(
      <div id="container">
        <CountdownTimer safeTimer seconds={10} />
      </div>,
    )
    expect(screen.getByText(onlySecondsFormatMatcher)).toBeInTheDocument()
  })

  test('time provided is more than a minute', () => {
    render(
      <div id="container">
        <CountdownTimer safeTimer seconds={minuteInSecs + 30} />
      </div>,
    )
    expect(screen.getByText(minutesFormatMatcher)).toBeInTheDocument()
  })

  test('time provided is more than an hour', () => {
    render(
      <div id="container">
        <CountdownTimer safeTimer seconds={hourInSecs + 30} />
      </div>,
    )
    expect(screen.getByText(hoursFormatMatcher)).toBeInTheDocument()
  })

  test('time provided is more than a day', () => {
    render(
      <div id="container">
        <CountdownTimer safeTimer seconds={dayInSecs + 30} />
      </div>,
    )
    expect(screen.getByText(daysFormatMatcher)).toBeInTheDocument()
  })

  test('a full day duration renders without an off-by-one day error', () => {
    render(
      <div id="container">
        <CountdownTimer safeTimer seconds={dayInSecs + 12 * hourInSecs + 30 * minuteInSecs} />
      </div>,
    )
    expect(screen.getByText('1d 12h 30m 0s')).toBeInTheDocument()
  })

  test('a multi-day campaign duration renders correctly', () => {
    render(
      <div id="container">
        <CountdownTimer safeTimer seconds={9 * dayInSecs} />
      </div>,
    )
    expect(screen.getByText('9d 0h 0m 0s')).toBeInTheDocument()
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

describe('CountdownTimer notifications', () => {
  const notificationPoints: Notification[] = [
    { timeRemaining: 3600, type: 'info' },
    { timeRemaining: 1800, type: 'warning' },
    { timeRemaining: 300, type: 'error' },
  ]
  const notificationTemplate = (minutes: number, seconds: number) => {
    if (seconds > 0) return `${minutes} minutes ${seconds} seconds remaining`
    return `${minutes} minutes remaining`
  }

  let infoSpy: ReturnType<typeof vi.spyOn>
  let warningSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    infoSpy = vi.spyOn(antdNotification, 'info').mockImplementation(() => {})
    warningSpy = vi.spyOn(antdNotification, 'warning').mockImplementation(() => {})
    errorSpy = vi.spyOn(antdNotification, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('only fires 5-minute notification when remaining time is 5 minutes', () => {
    const fiveMinutes = 300

    render(
      <CountdownTimer
        seconds={fiveMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '5 minutes remaining' }),
    )
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warningSpy).not.toHaveBeenCalled()
  })

  test('fires closest notification with actual remaining time when 20 minutes left', () => {
    const twentyMinutes = 20 * 60

    render(
      <CountdownTimer
        seconds={twentyMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '20 minutes remaining' }),
    )
    expect(infoSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('does not fire 60-min notification when remaining time is 30 minutes', () => {
    const thirtyMinutes = 30 * 60

    render(
      <CountdownTimer
        seconds={thirtyMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '30 minutes remaining' }),
    )
    expect(infoSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('fires only 60-min notification when remaining time is 60 minutes', () => {
    const sixtyMinutes = 60 * 60

    render(
      <CountdownTimer
        seconds={sixtyMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '60 minutes remaining' }),
    )
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('shows actual remaining time on load and fires 5-min when timer reaches it', () => {
    const tenMinutes = 10 * 60

    render(
      <CountdownTimer
        seconds={tenMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '10 minutes remaining' }),
    )
    expect(infoSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '5 minutes remaining' }),
    )
  })

  test('fires no notifications when no notification points are provided', () => {
    render(
      <CountdownTimer
        seconds={300}
        notificationPoints={[]}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(infoSpy).not.toHaveBeenCalled()
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('fires each notification naturally when timer starts above all points', () => {
    const seventyMinutes = 70 * 60

    render(
      <CountdownTimer
        seconds={seventyMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(infoSpy).not.toHaveBeenCalled()
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '60 minutes remaining' }),
    )
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000)
    })

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '30 minutes remaining' }),
    )
    expect(errorSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000)
    })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '5 minutes remaining' }),
    )
  })

  test('fires warning with actual time when 6 minutes remain and skips 60-min', () => {
    const sixMinutes = 6 * 60

    render(
      <CountdownTimer
        seconds={sixMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '6 minutes remaining' }),
    )
    expect(infoSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('fires info with actual time when 33 minutes remain', () => {
    const thirtyThreeMinutes = 33 * 60

    render(
      <CountdownTimer
        seconds={thirtyThreeMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '33 minutes remaining' }),
    )
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('fires actual remaining time when only one point is crossed on load', () => {
    const twentyFourMinutes = 24 * 60
    const points: Notification[] = [
      { timeRemaining: 1800, type: 'warning' },
      { timeRemaining: 900, type: 'warning' },
      { timeRemaining: 300, type: 'error' },
    ]

    render(
      <CountdownTimer
        seconds={twentyFourMinutes}
        notificationPoints={points}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: '24 minutes remaining' }),
    )
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('does not fire notifications when timer has expired', () => {
    const fiveMinutes = 5 * 60

    render(
      <CountdownTimer
        seconds={fiveMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    errorSpy.mockClear()
    infoSpy.mockClear()
    warningSpy.mockClear()

    act(() => {
      vi.advanceTimersByTime(6 * 60 * 1000)
    })

    expect(infoSpy).not.toHaveBeenCalled()
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('fires only one notification after returning from background', () => {
    const seventyMinutes = 70 * 60

    render(
      <CountdownTimer
        seconds={seventyMinutes}
        notificationPoints={notificationPoints}
        notificationTemplate={notificationTemplate}
      />,
    )

    expect(infoSpy).not.toHaveBeenCalled()
    expect(warningSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(65 * 60 * 1000)
    })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })
})
