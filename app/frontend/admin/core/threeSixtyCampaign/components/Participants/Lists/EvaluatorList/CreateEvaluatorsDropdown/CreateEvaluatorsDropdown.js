import React from 'react'
import {
  Button, Dropdown, Icon, Menu,
} from 'antd'

const CreateEvaluatorsDropdown = ({ openModal }) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={() => openModal('CreateEvaluatorModal')} key="1">
        Add Evaluators...
      </Menu.Item>
      <Menu.Item key="2" onClick={() => openModal('EvaluatorImportModal')}>Import Evaluators...</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} className="mrm" trigger={['click']}>
      <Button type="primary">
        <Icon type="plus" />
        <span>Add Evaluators</span>
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}

export default CreateEvaluatorsDropdown
