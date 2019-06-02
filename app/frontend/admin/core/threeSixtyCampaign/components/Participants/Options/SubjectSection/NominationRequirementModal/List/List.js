import React, { useState } from 'react'
import _ from 'lodash'
import {
  Icon, Dropdown, Menu, Input,
} from 'antd'
import cs from 'classnames'
import css from '../style.scss'

export default function List ({
  nominationRequirements: { selectedIndex, list },
  moveDown,
  moveUp,
  remove,
  rename,
  copy,
  changeSelectedIndex,
}) {
  if (_.isEmpty(list)) { return null }

  const [renamingEnabled, setRenamingEnabled] = useState(false)
  const [newName, setNewName] = useState(list[selectedIndex].name)

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
        setRenamingEnabled(true)
        break
      case 'copy':
        copy()
        break
      default:
        break
    }
  })

  const menu = handleMenuClick => (
    <Menu onClick={handleMenuClick}>
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

  const setupForRenaming = () => {
    setNewName(list[selectedIndex].name)
    setRenamingEnabled(true)
  }

  const renameWithValidation = () => {
    if (newName === '') {
      setNewName(list[selectedIndex].name)
    } else {
      rename(newName)
    }
    setRenamingEnabled(false)
  }

  return list.map((nominationRequirement, index) => {
    const selected = selectedIndex === index
    return (
      <div
        className={cs([
          css.nameContainer,
          { [css.activeNameContainer]: selectedIndex === index, [css.renamingEnabled]: selected && renamingEnabled },
        ])}
        key={index}
        role="button"
        tabIndex={index}
        onClick={() => selected || changeSelectedIndex(index)}
      >
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
          ) : _.truncate(nominationRequirement.name, { length: 24 })}
        </div>
        <Dropdown
          className="dropdown"
          overlay={() => menu(handleMenuClick(index))}
          placement="bottomLeft"
          trigger={['click']}
        >
          <div className={css.menuIcon}>
            <Icon type="caret-down" />
          </div>
        </Dropdown>
      </div>
    )
  })
}
