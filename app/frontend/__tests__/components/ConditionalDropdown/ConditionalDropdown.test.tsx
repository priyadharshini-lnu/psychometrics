import React from 'react'
import { render, within, fireEvent } from '@testing-library/react'
import { Menu } from 'antd'

import ConditionalDropdown from 'components/ConditionalDropdown'

test('it should not disable dropdown for menu with child', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={(
        <Menu>
          <Menu.Item key="export">
            <div>
              Raw
            </div>
          </Menu.Item>
        </Menu>
      )}
    />
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeFalsy()
})

test('it should disable dropdown for empty menu', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={(
        <Menu>
        </Menu>
      )}
    />
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeTruthy()
})

test('it should return null for empty menu with hideForEmptyMenu prop', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={(
        <Menu>
        </Menu>
      )}
      hideForEmptyMenu
    />
  )
  expect(container).toBeEmpty
})

test('it should not return null for menu with childs and hideForEmptyMenu prop', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={(
        <Menu>
          <Menu.Item key="export">
            <div>
              Raw
            </div>
          </Menu.Item>
        </Menu>
      )}
      hideForEmptyMenu
    />
  )
  expect(container).not.toBeEmpty
})

test('it disables dropdown for menu with all empty item groups', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={(
        <Menu>
          <Menu.ItemGroup title="Item 1">
          </Menu.ItemGroup>
          <Menu.ItemGroup title="Item 2">
          </Menu.ItemGroup>
        </Menu>
      )}
    />
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeTruthy()
})

test('it does not disables dropdown for menu with non empty item groups', () => {
  const { getByTestId, getAllByTestId, container } = render(
    <ConditionalDropdown
      menu={(
        <Menu className='okay'>
          <Menu.ItemGroup title="Item 1">
            <Menu.Item key="export">
              <div>
                Raw
              </div>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu>
      )}
    />
  )

  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeFalsy()
})

test('checks count of valid itemGroups inside menu as it hides empty item group.', () => {
  const { getByTestId, getAllByTestId, container } = render(
    <ConditionalDropdown
      menu={(
        <Menu data-testid="menu" className='okay'>
          <Menu.ItemGroup data-testid="item-group" title="Item 1">
            <Menu.Item key="export">
              <div>
                Raw
              </div>
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup data-testid="item-group" title="Item 2">
          </Menu.ItemGroup>
        </Menu>
      )}
    />
  )

  const element = container.querySelector('.ant-dropdown-trigger')

  element && fireEvent.click(element)

  const menuElement = getByTestId('menu')
  const menuItemGroupElements = within(menuElement).getAllByTestId('item-group')

  expect(menuItemGroupElements.length).toBe(1);
})

test('checks count of valid subMenu inside menu as it hides empty subMenu.', () => {
  const { getByTestId, getAllByTestId, container } = render(
    <ConditionalDropdown
      menu={(
        <Menu data-testid="menu" className='okay'>
          <Menu.SubMenu data-testid="sub-menu" key="SubMenu" title="Navigation 1">
              <Menu.Item key="export">
                <div>
                  Raw
                </div>
            </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu data-testid="sub-menu" key="SubMenu1" title="Navigation 2">
            </Menu.SubMenu>
        </Menu>
      )}
    />
  )

  const element = container.querySelector('.ant-dropdown-trigger')

  element && fireEvent.click(element)

  const menuElement = getByTestId('menu')
  const subMenuElements = within(menuElement).getAllByTestId('sub-menu')

  expect(subMenuElements.length).toBe(1);
})

test('it disables dropdown for menu with all empty sub menus', () => {
  const { container } = render(
    <ConditionalDropdown
      menu={(
        <Menu>
          <Menu.SubMenu key="SubMenu" title="Navigation 1">
          </Menu.SubMenu>
          <Menu.SubMenu key="SubMenu1" title="Navigation 2">
          </Menu.SubMenu>
        </Menu>
      )}
    />
  )
  const element = container.querySelector('.ant-dropdown-trigger')
  expect(element?.hasAttribute('disabled')).toBeTruthy()
})

test('it does not disables dropdown for menu with non empty sub menus', () => {
  const { container } = render(
      <ConditionalDropdown
        menu={(
          <Menu>
            <Menu.SubMenu key="SubMenu" title="Navigation 1">
              <Menu.Item key="export">
                <div>
                  Raw
                </div>
            </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="SubMenu1" title="Navigation 2">
            </Menu.SubMenu>
          </Menu>
        )}
      />
    )
    const element = container.querySelector('.ant-dropdown-trigger')
    expect(element?.hasAttribute('disabled')).toBeFalsy()
  })
