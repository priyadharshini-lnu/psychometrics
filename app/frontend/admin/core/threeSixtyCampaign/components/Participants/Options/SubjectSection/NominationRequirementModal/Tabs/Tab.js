import React, { useState } from 'react'
import _ from 'lodash'
import {
  Icon, Dropdown, Menu, Input,
} from 'antd'
import css from './style.scss'

export default function Tab ({
  nominationRequirements: { selectedIndex, list },
  moveDown,
  moveUp,
  remove,
  rename,
  copy,
  index,
}) {
  const [renamingEnabled, setRenamingEnabled] = useState(false)
  const [newName, setNewName] = useState(list[selectedIndex].name)
  const selected = selectedIndex === index

  const setupForRenaming = () => {
    setNewName(list[selectedIndex].name)
    setRenamingEnabled(true)
  }

  const handleMenuClick = _.curry((index, { key }) => {
    switch (key) {
      case 'moveUp':
        if (index === 0) { return }
        moveUp(index)
        break
      case 'moveDown':
        if (index === list.length - 1) { return }
        moveDown(index)
        break
      case 'delete':
        remove(index)
        break
      case 'rename':
        setupForRenaming()
        break
      case 'copy':
        copy()
        break
      default:
        break
    }
  })

  const menu = index => (
    <Menu onClick={handleMenuClick(index)}>
      <Menu.Item key="moveUp">
        Move Up
      </Menu.Item>
      <Menu.Item key="moveDown">
        Move down
      </Menu.Item>
      <Menu.Item key="rename">
        Rename
      </Menu.Item>
      <Menu.Item key="copy">
        Copy
      </Menu.Item>
      <Menu.Item key="delete">
        Delete
      </Menu.Item>
    </Menu>
  )

  const renameWithValidation = () => {
    if (newName === '') {
      setNewName(list[selectedIndex].name)
    } else {
      rename(newName)
    }
    setRenamingEnabled(false)
  }

  return (
    <div>
      <div className={css.name} role="button" tabIndex={-1} onClick={() => selected && setupForRenaming()}>
        {renamingEnabled && selected ? (
          <Input
            size="small"
            value={newName}
            onBlur={() => renameWithValidation()}
            onKeyPress={e => e.charCode === 13 && renameWithValidation()}
            onChange={(e) => {
              setNewName(e.target.value)
            }}
          />
        ) : list[index].name}
      </div>
      <div className={css.menu}>
        <Dropdown
          className="dropdown"
          overlay={menu(index)}
          placement="bottomLeft"
          trigger={['click']}
        >
          <Icon type="caret-down" />
        </Dropdown>
      </div>
    </div>
  )
}
