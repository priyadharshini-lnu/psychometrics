import React from 'react'
import { Menu as AntMenu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FactCheck, FormatListNumbered, ManageSearch, SmartToy,
} from '@thetalententerprise/glint/icons'
import routeUtils from '~/utils/route'
import { PropsFromRedux } from './connect'

const { I18n } = window

interface OwnProps {
  prefix?: string
}
const Menu: React.FC<OwnProps & PropsFromRedux> = ({
  prefix, campaignPermissions,
}) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)

  const menuItems = [
    { key: '/manage', icon: <ManageSearch />, label: I18n.t('assessments_reports.menu.manage') },
  ]
  if (campaignPermissions.manageCampaigns) {
    menuItems.push({
      key: '/sequencing',
      icon: <FormatListNumbered />,
      label: I18n.t('assessments_reports.menu.sequencing'),
    })
  }
  if (campaignPermissions.manageReportApprovalSettings) {
    menuItems.push({
      key: '/report_approval',
      icon: <FactCheck />,
      label: I18n.t('assessments_reports.menu.report_approval'),
    })
  }
  if (campaignPermissions.manageAiScoringApprovalSettings) {
    menuItems.push({
      key: '/ai_scoring_approval',
      icon: <SmartToy />,
      label: I18n.t('admin.ai_scoring_approval_settings'),
    })
  }

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  if (menuItems.length < 2) return null

  return (
    <div className="position-relative">
      <AntMenu
        onSelect={onSelect}
        selectedKeys={activeTab ? [activeTab.key] : []}
        mode="horizontal"
        items={menuItems}
      />
    </div>
  )
}

export default Menu
