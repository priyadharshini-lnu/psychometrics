import React from 'react'
import {
  Button, Dropdown, Menu,
} from 'antd'
import { PlusOutlined, DownOutlined } from '@ant-design/icons'

const CreateSubjectsDropdown = ({ openModal }) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={() => openModal('CreateSubjectModal')} key="1">
        Add Subjects...
      </Menu.Item>
      <Menu.Item key="2" onClick={() => openModal('SubjectImportModal')}>Import Subjects...</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} className="mrm" trigger={['click']}>
      <Button type="primary">
        <PlusOutlined />
        <span>Add Subjects</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default CreateSubjectsDropdown
