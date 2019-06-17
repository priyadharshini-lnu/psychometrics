import React from 'react'
import _ from 'lodash'
import { Menu } from 'antd'

export default function ({ emailTemplates, selectedId, changeTemplate }) {
  const groupedTemplate = _.groupBy(emailTemplates, 'category')

  return (
    <Menu
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => changeTemplate(key)}
      style={{ height: 700 }}
      mode="inline"
    >
      {_.map(groupedTemplate, (emailTemplates, category) => (
        <Menu.ItemGroup key={category} title={I18n.t(`administration.threesixty_campaigns.email_templates.categories.${category}`)}>
          {_.map(emailTemplates, emailTemplate => (
            <Menu.Item key={emailTemplate.id}>
              {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.name`)}
            </Menu.Item>
            ))}
        </Menu.ItemGroup>
      ))}
    </Menu>
  )
}
