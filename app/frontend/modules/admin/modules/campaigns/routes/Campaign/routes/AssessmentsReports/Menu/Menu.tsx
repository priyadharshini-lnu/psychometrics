import React from 'react'
import { Menu as AntMenu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
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

  const menuItems = [{ key: '/manage', label: I18n.t('assessments_reports.menu.manage') }]
  if (campaignPermissions.manageCampaigns) {
    menuItems.push({ key: '/sequencing', label: I18n.t('assessments_reports.menu.sequencing') })
  }
  if (campaignPermissions.manageReportApprovalSettings) {
    menuItems.push({ key: '/report_approval', label: I18n.t('assessments_reports.menu.report_approval') })
  }
  if (campaignPermissions.manageAiScoringApprovalSettings) {
    menuItems.push({ key: '/ai_scoring_approval', label: I18n.t('admin.ai_scoring_approval_settings') })
  }

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  return (
    <div className="position-relative">
      <AntMenu
        className="mbm"
        onSelect={onSelect}
        selectedKeys={activeTab ? [activeTab.key] : []}
        mode="horizontal"
        items={menuItems}
      />
    </div>
  )
}

export default Menu
