import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  SettingOutlined,
  PieChartOutlined,
  QrcodeOutlined,
  DatabaseOutlined,
  SolutionOutlined,
} from '@ant-design/icons'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'
import routeUtils from 'utils/route'

const { I18n } = window

interface Props {
  prefix?: string
  campaignPermissions: Campaign['permissions']
}

const TopMenu: React.FC<Props> = ({ prefix, campaignPermissions }) => {
  const { pathname } = useLocation()

  const history = useHistory()

  const handleOnSelect = ({ key }) => {
    const basePath = routeUtils.getBasePath(prefix)
    history.push(`${basePath}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/participants')) {
      return ['participants']
    }
    if (pathname.includes('/assessments_reports')) {
      return ['assessments_reports']
    }
    if (pathname.includes('/registration_codes')) {
      return ['registration_codes']
    }
    if (pathname.includes('/datasheet')) {
      return ['datasheet']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/options')) {
      return ['options']
    }
    return undefined
  }

  return (
    <Menu
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      // data-testid="top-level-navigation"
      mode="horizontal"
    >
      <Menu.Item key="participants" icon={<UserOutlined />}>
        Participants
      </Menu.Item>
      {campaignPermissions.manageCampaigns && (
        <Menu.Item key="assessments_reports" icon={<PieChartOutlined />}>
          Assessments & Reports
        </Menu.Item>
      )}
      {campaignPermissions.viewRegistrationCodes && (
        <Menu.Item key="registration_codes" icon={<QrcodeOutlined />}>
          Registration codes
        </Menu.Item>
      )}
      {campaignPermissions.viewDatasheets && (
        <Menu.Item key="datasheet" icon={<DatabaseOutlined />}>
          {I18n.t('common.model.datasheet')}
        </Menu.Item>
      )}
      {campaignPermissions.manageCampaignAdmins && (
        <Menu.Item key="admins" icon={<SolutionOutlined />}>
          {I18n.t('common.model.admins')}
        </Menu.Item>
      )}
      {campaignPermissions.manageOptions && (
        <Menu.Item key="options" icon={<SettingOutlined />}>
          Options
        </Menu.Item>
      )}
    </Menu>
  )
}

export default TopMenu
