import React from 'react'
import _ from 'lodash'
import { Menu } from 'antd'
import routeUtils from 'utils/routeUtils'
import settings from 'admin/core/threeSixtyCampaign/settings'

export default function TemplateMenu ({ history, instructionTemplates, selectedId }) {
  return (
    <Menu
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => routeUtils.moveTo(history, settings.urlPrefix, `/messages/instructions/${key}`)}
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
