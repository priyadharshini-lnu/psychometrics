import React from 'react'
import _ from 'lodash'
import { Menu } from 'antd'
import I18n from 'admin/core/common/I18n'

export default function ({ instructionTemplates, selectedId, changeTemplate }) {
  return (
    <Menu
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => changeTemplate(key)}
      style={{ height: 700 }}
      mode="inline"
    >
      {_.map(instructionTemplates, instructionTemplate => (
        <Menu.Item key={instructionTemplate.id}>
          {I18n.t(`administration.threesixty_campaigns.instruction_templates.${instructionTemplate.name}.name`)}
        </Menu.Item>
      ))}
    </Menu>
  )
}
