import _ from 'lodash'
import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import settings from '~/modules/admin/modules/threeSixtyCampaign/settings'
import routeUtils from '~/utils/route'

export default function TemplateMenu ({ instructionTemplates, selectedId }) {
  const navigate = useNavigate()
  return (
    <Menu
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => routeUtils.moveTo(navigate, settings.urlPrefix, `/messages/instructions/${key}`)}
      style={{ height: 700 }}
      mode="inline"
      items={_.map(instructionTemplates, instructionTemplate => ({
        key: instructionTemplate.id,
        label: I18n.t(`admin.${instructionTemplate.name}_name`),
      }))}
    />
  )
}
