import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InvitationTitle } from '~/glint/components/BookingCard/InvitationTitle'

test('TimeZone selection should return value as expected', async () => {
  const handleTimeZoneChange = jest.fn(zone => zone)

  render(
    <div id="container">
      <InvitationTitle
        currentTimeZone="Asia/Kolkata"
        title="Title"
        description="Description"
        onTimeZoneChange={handleTimeZoneChange}
      />
    </div>,
  )
  const selectedElement = screen.queryByText('(GMT+05:30) Asia/Kolkata')
  expect(selectedElement).toBeInTheDocument()
  const searchBox = screen.getByRole('combobox')
  await waitFor(async () => {
    await userEvent.click(searchBox)
    await userEvent.type(searchBox, 'Baku')
    const option = screen.getByText('(GMT+04:00) Asia/Baku')
    option.style['pointer-events'] = 'auto'
    await userEvent.click(option)
  })
  expect(handleTimeZoneChange).toHaveBeenCalledWith('Asia/Baku')
})
