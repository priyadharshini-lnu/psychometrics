import React from 'react'
import {
  Button, Dropdown, Menu,
} from 'antd'
import { PlusOutlined, DownOutlined } from '@ant-design/icons'

const CreateEvaluatorsDropdown = ({ openModal, permissions }) => {
  const menu = (
    <Menu>
      {permissions.addEvaluator && (
        <Menu.Item onClick={() => openModal('CreateEvaluatorModal')} key="1">
          Add Evaluators...
        </Menu.Item>
      )}
      {permissions.importEvaluator && (
        <Menu.Item key="2" onClick={() => openModal('EvaluatorImportModal')}>Import Evaluators...</Menu.Item>
      )}
    </Menu>
  )

  return (
    <Dropdown overlay={menu} className="mrm" trigger={['click']}>
      <Button type="primary">
        <PlusOutlined />
        <span>Add Evaluators</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default CreateEvaluatorsDropdown
