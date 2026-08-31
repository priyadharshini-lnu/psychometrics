import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { act } from 'react-dom/test-utils'
import { BrowserRouter as Router } from 'react-router-dom'

import { BookingsAndInvitesListComponent, SKELETON_ROWS } from '~/modules/endUser/modules/campaigns/routes/Bookings/routes/BookingsAndInvitesList'

const bookingsMockResponse = {
  response: {
    list: [{
      id: 1,
      title: 'This is title',
      description: 'Desscription here',
      duration: 3,
      status: 'accepted'
    },
    {
      id: 2,
      title: 'This is title',
      description: 'Desscription here',
      duration: 3,
      status: 'accepted'
    }],
  },
}
const invitesMockResponse = {
  response: {
    list: [{
      id: 1,
      title: 'This is title',
      description: 'Desscription here',
      status: 'accepted',
      duration: 3,
    },
    {
      id: 2,
      title: 'This is title',
      description: 'Desscription here',
      status: 'accepted',
      duration: 3,
    },
    {
      id: 3,
      title: 'This is title',
      description: 'Desscription here',
      status: 'accepted',
      duration: 3,
    }],
  },
}

test('should display list of invites and bookings', async () => {
  const user = userEvent.setup()
  const fetchBookings = vi.fn(() => Promise.resolve(bookingsMockResponse))
  const fetchInvites = vi.fn(() => Promise.resolve(Promise.resolve(invitesMockResponse)))

  const { findAllByRole, findByTestId } = render(
    <div data-testid="container">
      <Router >
        <Provider store={createStore(() => 'Test', 'Test')}>
          <BookingsAndInvitesListComponent
            bookingsLoading={false}
            invitesLoading={false}
            fetchInvites={fetchInvites}
            fetchBookings={fetchBookings}
          />
        </Provider>
      </Router>

    </div>,
  )
  const container = await findByTestId('container')
  const tabs = await findAllByRole('tab')
  const invitesDisplayed = await waitFor(() => container.querySelectorAll('.ant-tabs-content-active .detailsCard'))
  expect(invitesDisplayed.length).toBe(invitesMockResponse.response.list.length)
  const bookingsTab = tabs[1]
  await act(async () => {
    await user.click(bookingsTab)
  })
  const bookingsDisplayed = await waitFor(() => container.querySelectorAll('.ant-tabs-content-active .detailsCard'))
  expect(bookingsDisplayed.length).toBe(bookingsMockResponse.response.list.length)
})

test('should display invites count and booking count', async () => {
  const user = userEvent.setup()
  const fetchBookings = vi.fn(() => Promise.resolve(bookingsMockResponse))
  const fetchInvites = vi.fn(() => Promise.resolve(Promise.resolve(invitesMockResponse)))

  const { findAllByRole, findByTestId } = render(
    <div data-testid="container">
      <Router>
        <Provider store={createStore(() => 'Test', 'Test')}>
          <BookingsAndInvitesListComponent
            bookingsLoading={false}
            invitesLoading={false}
            fetchInvites={fetchInvites}
            fetchBookings={fetchBookings}
          />
        </Provider>
      </Router>

    </div>,
  )
  const container = await findByTestId('container')
  const tabs = await findAllByRole('tab')
  const invitesCountElement = await waitFor(() => container.querySelector('.ant-tabs-tab-active .count'))
  expect(invitesCountElement?.innerHTML).toBe(`(${invitesMockResponse.response.list.length})`)
  const bookingsTab = tabs[1]
  await act(async () => {
    await user.click(bookingsTab)
  })
  const bookingsCountElement = await waitFor(() => container.querySelector('.ant-tabs-tab-active .count'))
  expect(bookingsCountElement?.innerHTML).toBe(`(${bookingsMockResponse.response.list.length})`)
})

test('should display skeleton for both count & list of Invites and Bookings when request is in progress', async () => {
  const user = userEvent.setup()
  const fetchBookings = vi.fn(() => Promise.resolve(bookingsMockResponse))
  const fetchInvites = vi.fn(() => Promise.resolve(Promise.resolve(invitesMockResponse)))

  const { findAllByRole, findByTestId } = render(
    <div data-testid="container">
      <Router>
        <Provider store={createStore(() => 'Test', 'Test')}>
          <BookingsAndInvitesListComponent
            bookingsLoading
            invitesLoading
            fetchInvites={fetchInvites}
            fetchBookings={fetchBookings}
          />
        </Provider>
      </Router>

    </div>,
  )
  const container = await findByTestId('container')
  const tabs = await findAllByRole('tab')
  const invitesSkeletonRows = await waitFor(() => container.querySelectorAll('.ant-tabs-content-active .ant-skeleton.skeleton'))
  expect(invitesSkeletonRows.length).toBe(SKELETON_ROWS)
  const bookingsTab = tabs[1]
  await act(async () => {
    await user.click(bookingsTab)
  })
  const bookingsSkeletonRows = await waitFor(() => container.querySelectorAll('.ant-tabs-content-active .ant-skeleton.skeleton'))
  expect(bookingsSkeletonRows.length).toBe(SKELETON_ROWS)
  const countSkeleton = await waitFor(() => container.querySelectorAll('.ant-spin.ant-spin-spinning'))
  expect(countSkeleton.length).toBe(2)
})
