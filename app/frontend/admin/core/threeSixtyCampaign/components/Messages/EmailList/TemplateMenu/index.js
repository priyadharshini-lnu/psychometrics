import React from 'react'
import _ from 'lodash'
import { Menu } from 'antd'
import routeUtils from 'utils/routeUtils'
import settings from 'admin/core/threeSixtyCampaign/settings'
import { withRouter } from 'react-router-dom'

function TemplateMenu ({ history, emailTemplates, selectedId }) {
  const groupedTemplate = _.groupBy(emailTemplates, 'category')

  return (
    <Menu
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => routeUtils.moveTo(history, settings.urlPrefix, `/messages/email/${key}`)}
      style={{ height: 700 }}
      mode="inline"
    >
      {_.map(groupedTemplate, (emailTemplates, category) => (
        <Menu.ItemGroup
          key={category}
          title={I18n.t(`administration.threesixty_campaigns.email_templates.categories.${category}`)}
        >
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

export default withRouter(TemplateMenu)
