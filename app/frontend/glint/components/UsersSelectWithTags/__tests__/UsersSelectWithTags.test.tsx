import {
  render, screen, waitFor, cleanup,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { UsersSelectWithTags } from '~/glint'

jest.mock('use-debounce', () => ({
  useDebouncedCallback: fn => str => fn(str),
}))

const users = [
  {
    id: '1', fullName: 'John Doe', photoUrl: '', email: 'test@mail.com',
  },
  {
    id: '2', fullName: 'Rosy Paul', photoUrl: '', email: 'test@mail.com',
  },
  {
    id: '3', fullName: 'Yu Chen', photoUrl: '', email: 'test@mail.com',
  },
  {
    id: '4', fullName: 'Tommy Cremin', photoUrl: '', email: 'test@mail.com',
  },
]

describe('onChange Should return correct values', () => {
  const user = userEvent.setup()

  test('when a user is selected from the list', async () => {
    const handleChangeMockFn = jest.fn(ids => ids)

    render(
      <div id="container">
        <UsersSelectWithTags
          users={users}
          preSelectedUsers={[]}
          onUserSearch={() => null}
          onChange={handleChangeMockFn}
        />
      </div>,
    )

    const inputBox = screen.getByRole('combobox')

    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'j')
    })
    const user1 = screen.getByText(users[0].fullName)
    user1.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(user1)
    })
    expect(handleChangeMockFn).toHaveBeenCalledWith(['1'])

    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'j')
    })
    const user2 = screen.getByText(users[1].fullName)
    user2.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(user2)
    })
    expect(handleChangeMockFn).toHaveBeenCalledWith(['1', '2'])
  })

  test('when a user is removed from the list', async () => {
    const handleChangeMockFn = jest.fn(ids => ids)

    render(
      <div id="container">
        <UsersSelectWithTags
          users={users}
          preSelectedUsers={[]}
          onUserSearch={() => null}
          onChange={handleChangeMockFn}
        />
      </div>,
    )

    const inputBox = screen.getByRole('combobox')
    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'j')
    })

    const user1 = screen.getByText(users[0].fullName)
    user1.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(user1)
    })

    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'j')
    })
    const user2 = screen.getByText(users[1].fullName)
    user2.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(user2)
    })

    const removeUser1Button = screen.getByTestId('remove-userinfo-1')
    await act(async () => {
      await user.click(removeUser1Button)
    })
    expect(handleChangeMockFn).toHaveBeenLastCalledWith(['2'])

    const removeUser2Button = screen.getByTestId('remove-userinfo-2')
    await act(async () => {
      await user.click(removeUser2Button)
    })
    expect(handleChangeMockFn).toHaveBeenLastCalledWith([])
  })
})

describe('Dropdown should be hidden after user', () => {
  const user = userEvent.setup()

  test('selects an item from the dropdown', async () => {
    const handleChangeMockFn = jest.fn(ids => ids)

    render(
      <div id="container">
        <UsersSelectWithTags
          users={users}
          preSelectedUsers={[]}
          onUserSearch={() => null}
          onChange={handleChangeMockFn}
        />
      </div>,
    )

    const inputBox = screen.getByRole('combobox')
    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'j')
    })
    let hiddenDropdown = document.querySelector('.ant-select-dropdown-hidden')
    expect(hiddenDropdown).not.toBeInTheDocument()

    const user1 = screen.getByText(users[0].fullName)
    user1.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(user1)
    })
    hiddenDropdown = document.querySelector('.ant-select-dropdown-hidden')
    expect(hiddenDropdown).toBeInTheDocument()
  })

  test('clicks outside the dropdown', async () => {
    const handleChangeMockFn = jest.fn(ids => ids)

    render(
      <div id="container">
        <UsersSelectWithTags
          users={users}
          preSelectedUsers={[]}
          onUserSearch={() => null}
          onChange={handleChangeMockFn}
        />
      </div>,
    )

    const inputBox = screen.getByRole('combobox')
    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'j')
    })
    let hiddenDropdown = document.querySelector('.ant-select-dropdown-hidden')
    expect(hiddenDropdown).not.toBeInTheDocument()

    await act(async () => {
      await user.click(document.body)
    })
    hiddenDropdown = document.querySelector('.ant-select-dropdown-hidden')
    expect(hiddenDropdown).toBeInTheDocument()
  })
})

describe('Input text should be cleared after user', () => {
  const user = userEvent.setup()

  test('selects an item from the dropdown', async () => {
    const handleChangeMockFn = jest.fn(ids => ids)

    render(
      <div id="container">
        <UsersSelectWithTags
          users={users}
          preSelectedUsers={[]}
          onUserSearch={() => null}
          onChange={handleChangeMockFn}
        />
      </div>,
    )

    const inputBox = screen.getByRole('combobox')
    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'search')
    })
    expect(inputBox).toHaveValue('search')

    const user1 = screen.getByText(users[0].fullName)
    user1.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(user1)
    })
    expect(inputBox).toHaveValue('')
  })

  test('clicks outside the dropdown', async () => {
    const handleChangeMockFn = jest.fn(ids => ids)

    const {} = render(
      <div id="container">
        <UsersSelectWithTags
          users={users}
          preSelectedUsers={[]}
          onUserSearch={() => null}
          onChange={handleChangeMockFn}
        />
      </div>,
    )

    const inputBox = screen.getByRole('combobox')
    await waitFor(async () => {
      await user.click(inputBox)
      await user.type(inputBox, 'search')
    })
    expect(inputBox).toHaveValue('search')

    await act(async () => {
      await user.click(document.body)
    })
    expect(inputBox).toHaveValue('')
  })
})

test('onSearch should be called with correct values when user types some value in input box', async () => {
  const handleSearchMockFn = jest.fn(text => text)
  const user = userEvent.setup()

  render(
    <div id="container">
      <UsersSelectWithTags
        users={users}
        preSelectedUsers={[]}
        onUserSearch={handleSearchMockFn}
      />
    </div>,
  )

  const inputBox = screen.getByRole('combobox')
  await waitFor(async () => {
    await user.click(inputBox)
    await user.type(inputBox, 'search')
    expect(inputBox).toHaveValue('search')
  })
  expect(handleSearchMockFn).toHaveBeenLastCalledWith('search')
})
