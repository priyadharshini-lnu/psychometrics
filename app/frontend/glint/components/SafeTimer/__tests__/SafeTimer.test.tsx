import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { SafeTimer } from '../SafeTimer'

const minuteInSecs = 60
const hourInSecs = 60 * minuteInSecs
const dayInSecs = 24 * hourInSecs

const dayFormat = 'D[d] H[h] m[m] s[s]'
const hourFormat = 'H[h] m[m] s[s]'
const minuteFormat = 'm[m] s[s]'

describe('SafeTimer display format', () => {
  test('shows only seconds when less than a minute remains', () => {
    render(<SafeTimer remainingTime={45} format="ss[s]" onFinish={vi.fn()} />)
    expect(screen.getByText('45s')).toBeInTheDocument()
  })

  test('shows minutes and seconds when less than an hour remains', () => {
    render(<SafeTimer remainingTime={5 * minuteInSecs + 30} format={minuteFormat} onFinish={vi.fn()} />)
    expect(screen.getByText('5m 30s')).toBeInTheDocument()
  })

  test('shows hours, minutes and seconds when less than a day remains', () => {
    render(<SafeTimer remainingTime={3 * hourInSecs + 5 * minuteInSecs} format={hourFormat} onFinish={vi.fn()} />)
    expect(screen.getByText('3h 5m 0s')).toBeInTheDocument()
  })

  test('shows a full day duration without an off-by-one day error', () => {
    // Regression: previously rendered as "2d 18h 0m 0s" because the milliseconds
    // were formatted as a calendar date (day-of-month is 1-indexed) instead of a duration.
    render(
      <SafeTimer
        remainingTime={dayInSecs + 12 * hourInSecs + 30 * minuteInSecs}
        format={dayFormat}
        onFinish={vi.fn()}
      />,
    )
    expect(screen.getByText('1d 12h 30m 0s')).toBeInTheDocument()
  })

  test('shows a multi-day campaign duration correctly', () => {
    render(<SafeTimer remainingTime={9 * dayInSecs} format={dayFormat} onFinish={vi.fn()} />)
    expect(screen.getByText('9d 0h 0m 0s')).toBeInTheDocument()
  })

  test('resyncs the display when the remainingTime prop changes', () => {
    const { rerender } = render(
      <SafeTimer remainingTime={5 * minuteInSecs} format={minuteFormat} onFinish={vi.fn()} />,
    )
    expect(screen.getByText('5m 0s')).toBeInTheDocument()

    rerender(<SafeTimer remainingTime={2 * hourInSecs} format={hourFormat} onFinish={vi.fn()} />)
    expect(screen.getByText('2h 0m 0s')).toBeInTheDocument()
  })

  test('renders nothing when remainingTime is null', () => {
    const { container } = render(<SafeTimer remainingTime={null} onFinish={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('SafeTimer countdown behaviour', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('emits the remaining time to onChange in milliseconds', () => {
    const onChange = vi.fn()
    render(<SafeTimer remainingTime={65} onChange={onChange} format={minuteFormat} onFinish={vi.fn()} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const lastEmittedValue = onChange.mock.calls.at(-1)?.[0]
    // After ~1 second of a 65s timer the remaining time is 64000ms, not 64s.
    expect(lastEmittedValue).toBe(64000)
  })

  test('calls onFinish once when the timer reaches zero', () => {
    const onFinish = vi.fn()
    render(<SafeTimer remainingTime={2} format={minuteFormat} onFinish={onFinish} />)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(onFinish).toHaveBeenCalledTimes(1)
  })
})

describe('SafeTimer clock-jump handling', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('ignores large system clock jumps instead of collapsing the countdown', () => {
    let wallClock = 1_000_000
    // Control the wall clock independently of the fake setTimeout queue so we can
    // simulate the OS clock jumping while a scheduled tick is still pending.
    vi.spyOn(Date, 'now').mockImplementation(() => wallClock)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const onChange = vi.fn()
    const onTimeShiftDetected = vi.fn()
    render(
      <SafeTimer
        remainingTime={5 * minuteInSecs}
        format={minuteFormat}
        onChange={onChange}
        onTimeShiftDetected={onTimeShiftDetected}
        onFinish={vi.fn()}
      />,
    )

    // Simulate the OS clock jumping forward by 2 minutes (beyond the 60s threshold).
    wallClock += 120_000

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTimeShiftDetected).toHaveBeenCalled()
    // The jump is ignored, so the countdown does not lose 2 minutes.
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('5m 0s')).toBeInTheDocument()
  })
})
