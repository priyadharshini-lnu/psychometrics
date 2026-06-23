import _ from 'lodash'
import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import settings from '~/modules/admin/modules/threeSixtyCampaign/settings'
import routeUtils from '~/utils/route'

function TemplateMenu ({ emailTemplates, selectedId }) {
  const navigate = useNavigate()
  const groupedTemplate = _.groupBy(emailTemplates, 'category')
  const menuItems = [..._.map(groupedTemplate, (emailTemplates, category) => (
    {
      key: category,
      type: 'group',
      label: I18n.t(`admin.categories_${category}`),
      children: [..._.map(emailTemplates, emailTemplate => (
        {
          key: emailTemplate.id,
          label: I18n.t(`admin.${emailTemplate.name}_name`),
        }
      ))],
    }
  )),
  ]

  return (
    <Menu
      items={menuItems}
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => routeUtils.moveTo(navigate, settings.urlPrefix, `/messages/email/${key}`)}
      style={{ height: 700 }}
      mode="inline"
    />
  )
}
export default TemplateMenu
