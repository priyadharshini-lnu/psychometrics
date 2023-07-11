import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { UserInfoCard } from '~/glint'

test('Do not show Remove button when onRemove prop not passed', async () => {
  const id = 1

  const { queryByTestId } = render(
    <div id="container">
      <Provider store={createStore(() => 'Test', 'Test')}>
        <UserInfoCard
          nameLabel="John Doe"
          nameText="John Doe"
          id={id}
        />
      </Provider>
    </div>,
  )
  const removeButton = await queryByTestId(`remove-userinfo-${id}`)
  expect(removeButton).toBe(null)
})

test('Remove button callback function should be called', async () => {
  const user = userEvent.setup()
  const id = 1
  const handleRemove = jest.fn(id => id)

  const { findByTestId } = render(
    <div id="container">
      <Provider store={createStore(() => 'Test', 'Test')}>
        <UserInfoCard
          nameLabel="John Doe"
          nameText="John Doe"
          id={id}
          onRemove={handleRemove}
        />
      </Provider>
    </div>,
  )
  const removeButton = await findByTestId(`remove-userinfo-${id}`)
  await user.click(removeButton)
  expect(handleRemove).toHaveBeenCalledWith(id)
})
