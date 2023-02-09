import _ from 'lodash'
import { Menu } from 'antd'
import settings from '~/modules/admin/modules/threeSixtyCampaign/settings'
import routeUtils from '~/utils/route'

export default function TemplateMenu ({ history, instructionTemplates, selectedId }) {
  return (
    <Menu
      selectedKeys={[selectedId.toString()]}
      onClick={({ key }) => routeUtils.moveTo(history, settings.urlPrefix, `/messages/instructions/${key}`)}
      style={{ height: 700 }}
      mode="inline"
      items={_.map(instructionTemplates, instructionTemplate => ({
        key: instructionTemplate.id,
        label: I18n.t(`administration.threesixty_campaigns.instruction_templates.${instructionTemplate.name}.name`),
      }))}
    />
  )
}
