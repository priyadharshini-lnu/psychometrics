import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

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
  const selectedElement = screen.queryByText('Asia/Kolkata')
  expect(selectedElement).toBeInTheDocument()
  const searchBox = screen.getByRole('combobox')
  await act(async () => {
    await userEvent.click(searchBox)
    await userEvent.type(searchBox, 'baku')
    const option = screen.getByText('(GMT+04:00) Asia/Baku')
    option.style['pointer-events'] = 'auto'
    await userEvent.click(option)
  })
  expect(handleTimeZoneChange).toHaveBeenCalledWith('Asia/Baku')
})
