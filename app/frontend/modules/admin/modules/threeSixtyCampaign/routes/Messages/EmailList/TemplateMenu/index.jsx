import _ from 'lodash'
import { Menu } from 'antd'
import { withRouter } from 'react-router-dom'
import settings from '~/modules/admin/modules/threeSixtyCampaign/settings'
import routeUtils from '~/utils/route'

function TemplateMenu ({ history, emailTemplates, selectedId }) {
  const groupedTemplate = _.groupBy(emailTemplates, 'category')
  const menuItems = [..._.map(groupedTemplate, (emailTemplates, category) => (
    {
      key: category,
      type: 'group',
      label: I18n.t(`administration.threesixty_campaigns.email_templates.categories.${category}`),
      children: [..._.map(emailTemplates, emailTemplate => (
        {
          key: emailTemplate.id,
          label: I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.name`),
        }
      ))],
    }
  )),
  ]

  return (
    <Menu
      items={menuItems}
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => routeUtils.moveTo(history, settings.urlPrefix, `/messages/email/${key}`)}
      style={{ height: 700 }}
      mode="inline"
    />
  )
}
export default withRouter(TemplateMenu)
