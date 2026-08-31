import { renderHook } from '@testing-library/react'

type UseTimezones = typeof import('~/hooks/useTimezones').useTimezones

// The options list is cached at module scope, so each test needs a cold module.
const loadUseTimezones = async (): Promise<UseTimezones> => {
  vi.resetModules()

  return (await import('~/hooks/useTimezones')).useTimezones
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('builds the zone list once and reuses it across renders', async () => {
  const supportedValuesOf = vi.spyOn(Intl, 'supportedValuesOf')
  const useTimezones = await loadUseTimezones()

  const { rerender } = renderHook(({ zone }) => useTimezones(zone), {
    initialProps: { zone: 'Asia/Dubai' },
  })

  rerender({ zone: 'Europe/London' })
  renderHook(() => useTimezones('America/New_York'))

  expect(supportedValuesOf).toHaveBeenCalledTimes(1)
})

const offsetFromLabel = (label: string): number => {
  const [, sign, hours, minutes] = /^\(GMT([+-])(\d{2}):(\d{2})\)/.exec(label) || []

  return (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes))
}

test('returns every supported zone sorted by UTC offset', async () => {
  const useTimezones = await loadUseTimezones()

  const { result } = renderHook(() => useTimezones('Asia/Dubai'))
  const offsets = result.current.slice(1).map(option => offsetFromLabel(option.label))

  expect(result.current).toHaveLength(Intl.supportedValuesOf('timeZone').length)
  expect([...offsets].sort((a, b) => a - b)).toEqual(offsets)
})

test('formats labels as "(GMT±HH:mm) Zone"', async () => {
  const useTimezones = await loadUseTimezones()

  const { result } = renderHook(() => useTimezones('Asia/Dubai'))

  expect(result.current[0]).toEqual({ value: 'Asia/Dubai', label: '(GMT+04:00) Asia/Dubai' })
  result.current.forEach(option => {
    expect(option.label).toEqual(expect.stringMatching(/^\(GMT[+-]\d{2}:\d{2}\) .+/))
  })
})

test('moves the current zone to the top without duplicating it', async () => {
  const useTimezones = await loadUseTimezones()

  const { result } = renderHook(() => useTimezones('Asia/Calcutta'))

  expect(result.current[0].value).toEqual('Asia/Kolkata')
  expect(result.current.filter(option => option.value === 'Asia/Kolkata')).toHaveLength(1)
})
