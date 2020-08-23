import React, { Attributes } from 'react'
import _ from 'lodash'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Menu as AntMenu } from 'antd'
import routeUtils from 'utils/route'

interface Props extends Attributes {
  prefix?: string
}
const { I18n } = window

const ROUTES = ['/manage', '/sequencing']

const Menu: React.FC<Props & RouteComponentProps> = ({ history, prefix }) => {
  const onClick = ({ key }) => routeUtils.moveTo(history, prefix, key)

  const active = _.find(ROUTES, (key => location.pathname.includes(key))) as string

  return (
    <AntMenu className="mbm" onSelect={onClick} selectedKeys={[active]} mode="horizontal">
      <AntMenu.Item key="/manage">
        {I18n.t('assessments_reports.menu.manage')}
      </AntMenu.Item>
      <AntMenu.Item key="/sequencing">
        {I18n.t('assessments_reports.menu.sequencing')}
      </AntMenu.Item>
    </AntMenu>
  )
}

export default withRouter(Menu)
