import {
  render, within, fireEvent, waitFor,
} from '@testing-library/react'

import ConditionalDropdown from '~/components/ConditionalDropdown'

const singleMenuItem = [{ key: 'export', label: <div>Raw</div> }]

test('it should not disable dropdown for menu with child', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{ items: singleMenuItem }}
    />,
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeFalsy()
})

test('it should disable dropdown for empty menu', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{ items: [] }}
    />,
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeTruthy()
})

test('it should return null for empty menu with hideForEmptyMenu prop', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{ items: [] }}
      hideForEmptyMenu
    />,
  )
  expect(container).toBeEmptyDOMElement()
})

test('it should not return null for menu with childs and hideForEmptyMenu prop', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{ items: singleMenuItem }
      }
      hideForEmptyMenu
    />,
  )
  expect(container).not.toBeEmptyDOMElement()
})

test('it disables dropdown for menu with all empty item groups', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{
        items: [{ type: 'group', label: 'Item 1', children: [] },
          { type: 'group', label: 'Item 2', children: [] }],
      }
      }
    />,
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeTruthy()
})

test('it does not disables dropdown for menu with non empty item groups', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{
        items: [{ type: 'group', label: 'Item 1', children: singleMenuItem }], className: 'okay',
      }}
    />,
  )

  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeFalsy()
})

test('checks count of valid itemGroups inside menu as it hides empty item group.', async () => {
  const { getByTestId, container } = render(
    <ConditionalDropdown
      menu={{
        'data-testid': 'menu',
        className: 'okay',
        items: [
          { type: 'group', label: <div data-testid="item-group">Item 1</div>, children: singleMenuItem },
          { type: 'group', label: <div data-testid="item-group">Item 2</div>, children: [] },
        ],
      }}
    />,
  )

  await waitFor(() => {
    const element = container.querySelector('.ant-dropdown-trigger')
    element && fireEvent.click(element)
  })

  const menuElement = getByTestId('menu')
  const menuItemGroupElements = within(menuElement).getAllByTestId('item-group')

  expect(menuItemGroupElements.length).toBe(1)
})

test('checks count of valid subMenu inside menu as it hides empty subMenu.', async () => {
  const { getByTestId, container } = render(
    <ConditionalDropdown
      menu={{
        'data-testid': 'menu',
        className: 'okay',
        items: [
          { key: 'SubMenu', label: <div data-testid="sub-menu">Navigation 1</div>, children: singleMenuItem },
          { key: 'SubMenu', label: <div data-testid="sub-menu">Navigation 2</div>, children: [] },
        ],
      }}
    />,
  )

  await waitFor(() => {
    const element = container.querySelector('.ant-dropdown-trigger')
    element && fireEvent.click(element)
  })

  const menuElement = getByTestId('menu')
  const subMenuElements = within(menuElement).getAllByTestId('sub-menu')

  expect(subMenuElements.length).toBe(1)
})

test('it disables dropdown for menu with all empty sub menus', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{
        items: [
          { key: 'SubMenu', label: <div data-testid="sub-menu">Navigation 1</div>, children: [] },
          { key: 'SubMenu', label: <div data-testid="sub-menu">Navigation 2</div>, children: [] },
        ],
      }}
    />,
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeTruthy()
})

test('it does not disables dropdown for menu with non empty sub menus', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={{
        items: [
          { key: 'SubMenu', label: <div data-testid="sub-menu">Navigation 1</div>, children: singleMenuItem },
          { key: 'SubMenu', label: <div data-testid="sub-menu">Navigation 2</div>, children: [] },
        ],
      }
      }

    />,
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeFalsy()
})

test('it removes invalid divider', async () => {
  const { getByTestId, container } = render(
    <ConditionalDropdown
      menu={{
        'data-testid': 'menu',
        items: [
          { key: 'item1', label: <div data-testid="valid_item">Navigation 1</div> },
          { type: 'divider' },
          { type: 'divider' },
          { key: 'item2', label: <div data-testid="valid_item">Navigation 2</div> },
        ],
      }
      }

    />,
  )
  await waitFor(() => {
    const element = container.querySelector('.ant-dropdown-trigger')
    element && fireEvent.click(element)
  })


  const menuElement = getByTestId('menu')
  const dividerElement = menuElement.querySelectorAll('.ant-dropdown-menu-item-divider')
  expect(dividerElement && dividerElement.length).toEqual(1)
})

test('it does not remove valid divider', async () => {
  const { getByTestId, container } = render(
    <ConditionalDropdown
      menu={{
        'data-testid': 'menu',
        items: [
          { key: 'item1', label: <div data-testid="valid_item">Navigation 1</div> },
          { type: 'divider' },
          { key: 'item2', label: <div data-testid="valid_item">Navigation 2</div> },
        ],
      }
        }
    />,
  )
  await waitFor(() => {
    const element = container.querySelector('.ant-dropdown-trigger')
    element && fireEvent.click(element)
  })

  const menuElement = getByTestId('menu')
  const dividerElement = menuElement.querySelector('.ant-dropdown-menu-item-divider')
  expect(dividerElement).toBeTruthy()
})
