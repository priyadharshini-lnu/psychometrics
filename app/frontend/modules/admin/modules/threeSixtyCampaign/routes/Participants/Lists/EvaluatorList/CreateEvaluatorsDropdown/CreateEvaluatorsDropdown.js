import React from 'react'
import {
  Button, Menu,
} from 'antd'
import ConditionalDropdown from 'components/ConditionalDropdown'
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
    <ConditionalDropdown
      menu={menu}
      className="mrm"
      hideForEmptyMenu
      innerElement={(
        <Button type="primary">
          <PlusOutlined />
          <span>Add Evaluators</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}

export default CreateEvaluatorsDropdown
