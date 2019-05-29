import React from 'react'
import _ from 'lodash'
import {
  Icon, Dropdown, Menu
} from 'antd'
import css from '../style'
import cs from 'classnames'

export default function List ({
  nominationRequirements: { selectedIndex, list },
  moveDown,
  moveUp,
  changeSelectedIndex,
  match: {
    params: { campaignId },
  },
}) {

  const handleMenuClick = _.curry((index, { key }) => {
    switch(key) {
      case 'moveUp':
        moveUp(campaignId, index)
        break
      case 'moveDown':
        moveDown(campaignId, index)
        break
    }
  })

  const menu = (handleMenuClick) => (
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
  );

  const handleNameClick = (index) => {
    if (selectedIndex == index) {

    } else {
      changeSelectedIndex(index)
    }
  }

  return list.map((nominationRequirement, index) => {
    return (
      <div
        className={cs([css.nameContainer, { [css.activeNameContainer]: selectedIndex === index }])}
        key={index}
        onClick={() => handleNameClick(index)} >
        <div className={css.name}>
          {nominationRequirement.name}
        </div>
        <Dropdown className='dropdown' overlay={() => menu(handleMenuClick(index))} placement="bottomLeft" trigger={['click']}>
          <div className={css.menuIcon}>
            <Icon type="caret-down" />
          </div>
        </Dropdown>
      </div>
    )
  })
}
