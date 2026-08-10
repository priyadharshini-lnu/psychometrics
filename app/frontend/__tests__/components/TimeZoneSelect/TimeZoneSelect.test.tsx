import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TimeZoneSelect from '~/components/TimeZoneSelect'

const zoneCount = Intl.supportedValuesOf('timeZone').length

const renderedOptions = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('.ant-select-item-option-content'))

const openDropdown = async () => {
  await userEvent.click(screen.getByRole('combobox'))
  await screen.findByRole('listbox')
}

test('renders a virtualized window of zones rather than every supported zone', async () => {
  render(<TimeZoneSelect value="Asia/Dubai" onChange={vi.fn()} />)

  await openDropdown()

  const options = renderedOptions()

  expect(options.length).toBeGreaterThan(0)
  expect(options.length).toBeLessThan(zoneCount / 4)
  expect(options[0]).toHaveTextContent('(GMT+04:00) Asia/Dubai')
})

test('filters the zones by the typed search term', async () => {
  render(<TimeZoneSelect value="Asia/Dubai" onChange={vi.fn()} />)

  await openDropdown()
  await userEvent.type(screen.getByRole('combobox'), 'kolkata')

  const options = renderedOptions()

  expect(options).toHaveLength(1)
  expect(options[0]).toHaveTextContent('(GMT+05:30) Asia/Kolkata')
})

test('reports the selected zone value to onChange', async () => {
  const onChange = vi.fn()

  render(<TimeZoneSelect value="Asia/Dubai" onChange={onChange} />)

  await openDropdown()
  await userEvent.type(screen.getByRole('combobox'), 'kolkata')
  await userEvent.click(renderedOptions()[0])

  expect(onChange).toHaveBeenCalledWith('Asia/Kolkata')
})
