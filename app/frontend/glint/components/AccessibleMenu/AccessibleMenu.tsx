import { FC, useEffect, useRef } from 'react'
import { Menu, MenuProps, MenuRef } from 'antd'

export const AccessibleMenu:FC<Omit<MenuProps, 'ref'>> = (props) => {
  const { selectedKeys, onSelect, onFocus } = props
  const menuRef = useRef<MenuRef>(null)
  const menuItemLinkRef = useRef<HTMLAnchorElement | null>(null)

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

  const handleSelect = (data) => {
    // Skip triggering the click event if Command (metaKey) or Ctrl (ctrlKey) is pressed
    if (data.domEvent?.metaKey || data.domEvent?.ctrlKey) {
      onSelect?.(data)
      return
    }

    // Pass keyboard click to the child anchor tag of menuitem to make keyboard click (Enter/Space) work
    if (menuItemLinkRef.current) {
      menuItemLinkRef.current.click()
      menuItemLinkRef.current = null
    }
    onSelect?.(data)
  }

  // antd menu has keyboard and screenreader accessibility issue when anchor tag is used as menuitem.
  // setting focus on menuitem(<li>) instead of anchor tag will fix this issue
  // set focus on menu item for screenreader accessibility
  const handleFocus = (e) => {
    const menuItemIsALink = e.target.tagName === 'A'
    if (menuItemIsALink) {
      menuItemLinkRef.current = e.target
      e.target.parentNode?.parentNode?.focus()
    }
    onFocus && onFocus(e)
  }
  return (
    <Menu {...props} ref={menuRef} onFocus={handleFocus} onSelect={handleSelect} />
  )
}
