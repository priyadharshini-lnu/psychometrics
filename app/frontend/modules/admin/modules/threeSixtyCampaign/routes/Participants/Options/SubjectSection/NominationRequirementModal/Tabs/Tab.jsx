import { useState } from 'react'
import _ from 'lodash'
import { Dropdown, Input } from 'antd'
import cs from 'classnames'
import { CaretDownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'

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

  const getMenuProps = index => (
    {
      items: [
        { label: 'Move Up', key: 'moveUp' },
        { label: 'Move down', key: 'moveDown' },
        { label: 'Rename', key: 'rename' },
        { label: 'Copy', key: 'copy' },
        { label: 'Delete', key: 'delete' },
      ],
      onClick: handleMenuClick(index),
    }
  )

  const renameWithValidation = () => {
    if (newName === '') {
      setNewName(list[selectedIndex].name)
    } else {
      rename(newName)
    }
    setRenamingEnabled(false)
  }

  const renamingInProgress = renamingEnabled && selected
  if (!selected && renamingEnabled) { setRenamingEnabled(false) }

  return (
    <div>
      <div className={styles.name} role="button" tabIndex={-1} onClick={() => selected && setupForRenaming()}>
        <Input
          size="small"
          value={newName}
          onBlur={() => renameWithValidation()}
          onKeyPress={e => e.charCode === 13 && renameWithValidation()}
          onChange={(e) => {
            setNewName(e.target.value)
          }}
          className={cs({ hidden: !renamingInProgress })}
        />
        <span className={cs({ hidden: renamingInProgress })}>
          {list[index].name}
        </span>
      </div>
      <div className={styles.menu}>
        <Dropdown
          className="dropdown"
          menu={getMenuProps(index)}
          placement="bottomLeft"
          trigger={['click']}
        >
          <CaretDownOutlined />
        </Dropdown>
      </div>
    </div>
  )
}
