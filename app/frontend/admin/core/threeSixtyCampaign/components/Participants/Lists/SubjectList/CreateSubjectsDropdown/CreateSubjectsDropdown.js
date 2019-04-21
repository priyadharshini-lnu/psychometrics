import React from 'react'
import {Button, Dropdown, Icon, Menu} from 'antd'


const CreateSubjectsDropdown = ({ openModal }) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={() => openModal('CreateSubjectModal')} key="1">Add Subjects...</Menu.Item>
      <Menu.Item key="2">Import Subjects...</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} className="mrm" trigger={['click']}>
      <Button type="primary">
        <Icon type="plus" />
        <span>Add Subjects</span>
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}

export default CreateSubjectsDropdown
