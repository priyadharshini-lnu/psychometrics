import React from 'react'
import { Menu as AntMenu } from 'antd'
import { useNavigate } from 'react-router-dom'
import routeUtils from '~/utils/route'
import routes from '../routes'
import { PropsFromRedux } from './connect'

const { I18n } = window

interface OwnProps {
  prefix?: string
}
const Menu: React.FC<OwnProps & PropsFromRedux> = ({
  prefix,
}) => {
  const navigate = useNavigate()
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)

  const menuItems = [
    { key: '/manage', label: I18n.t('assessments_reports.menu.manage') },
    { key: '/sequencing', label: I18n.t('assessments_reports.menu.sequencing') },
    { key: '/report_approval', label: I18n.t('assessments_reports.menu.report_approval') },
  ]

  return (
    <div className="position-relative">
      <AntMenu
        className="mbm"
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
        items={menuItems}
      />
    </div>
  )
}

export default Menu
