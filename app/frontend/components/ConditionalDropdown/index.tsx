import React, { ReactElement } from 'react'

interface DropdownProps {
  menu: ReactElement
  dropdown: ReactElement,
  placeholder?: string | null,
}

export default function ConditionalDropdown (props: DropdownProps) {
  const {
    menu, dropdown, placeholder,
  } = props

  const placeholderValue = placeholder ? (
    <div>
      {placeholder}
    </div>
  ) : null

  function showMenuWithItemGroup (menu) {
    const childrens = toArray(menu.props.children)
    return childrens.length
      ? childrens.every(child => React.isValidElement(child))
      : null
  }

  function toArray (children) {
    if (children === undefined || children === false) return []

    return Array.isArray(children) ? children : [children]
  }

  return (
    showMenuWithItemGroup(menu) ? dropdown : placeholderValue
  )
}
