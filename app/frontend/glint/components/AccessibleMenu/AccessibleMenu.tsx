import { FC, useEffect, useRef } from 'react'
import { Menu, MenuProps, MenuRef } from 'antd'

export const AccessibleMenu:FC<Omit<MenuProps, 'ref'>> = (props) => {
  const { selectedKeys } = props
  const menuRef = useRef<MenuRef>(null)
  useEffect(() => {
    if (menuRef.current?.menu?.list) {
      // remove attribute from previously selected item
      const previousSelectedMenuElement = menuRef.current.menu.list.querySelector('[aria-current="page"]')
      previousSelectedMenuElement?.removeAttribute('aria-current')

      // add attribute to currently selected item
      const selectedMenuElement = menuRef.current.menu.list.querySelector('.ant-menu-item-selected')
      selectedMenuElement?.setAttribute('aria-current', 'page')
    }
  }, [selectedKeys])
  return (
    <Menu {...props} ref={menuRef} />
  )
}
