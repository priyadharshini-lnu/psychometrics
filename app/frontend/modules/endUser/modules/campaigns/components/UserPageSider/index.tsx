import React, { useRef, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons'

import { PageSider } from 'glint'
import { CampaignIcon } from 'glint/icons'

import { history } from 'modules/user/store'
import { RootState } from 'modules/user/core/rootReducers'
import {
  getProjectLogo,
  getName as getProjectName,
} from 'modules/user/modules/campaigns/core/project'
import styles from './styles.less'

const connector = connect((state: RootState) => ({
  logo: getProjectLogo(state),
  projectName: getProjectName(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>
type UserPageSiderProps = {
  showInsights: boolean
  siderFooter: (collapsed: boolean) => React.ReactElement
} & PropsFromRedux

const { I18n } = window

const getMenuItems = (showCampaign?: boolean, showInsights?: boolean) => ([{
  key: 'dashboard',
  label: I18n.t('campaign.dashboard_menu.home'),
  icon: <HomeOutlined className={styles.siderIcon} />,
}, ...showCampaign ? [{
  key: 'campaign',
  label: I18n.t('campaign.dashboard_menu.campaign'),
  icon: <CampaignIcon className={styles.siderIcon} />,
  children: showInsights !== false ? [
    { label: I18n.t('campaign.dashboard_menu.tasks'), key: 'tasks' },
    { label: I18n.t('campaign.dashboard_menu.insights'), key: 'insights' },
  ] : [{ label: 'Tasks', key: 'tasks' }],
}] : [], {
  key: 'profile',
  label: I18n.t('campaign.dashboard_menu.profile'),
  icon: <UserOutlined className={styles.siderIcon} />,
}])

const UserPageSiderComponent: FC<UserPageSiderProps> = ({
  showInsights, siderFooter, logo, projectName,
}) => {
  const location = useLocation()
  const { pathname } = location
  let menuItems = getMenuItems()
  let activeItem:string
  const campaignIdRef = useRef<string>('')
  const isAnonym = pathname.includes('/anonym/')

  const handleMenuSelect = (menu) => {
    if (menu.key === 'tasks') {
      return history.push(`/campaigns/${campaignIdRef.current}`)
    }
    if (menu.key === 'insights') {
      return history.push(`/campaigns/${campaignIdRef.current}/${menu.key}`)
    }
    history.push(`/${menu.key}`)
  }

  if (pathname.includes('/campaigns/') || pathname.includes('/threesixty_campaigns/')) {
    const [,, campaignId] = location.pathname.split('/')
    campaignIdRef.current = campaignId
    menuItems = getMenuItems(true, pathname.includes('/threesixty_campaigns/') ? false : showInsights)
    activeItem = pathname.includes('insights') ? 'insights' : 'tasks'
  } else {
    activeItem = pathname.slice(1)
    activeItem = activeItem || 'dashboard'
  }

  if (pathname.includes('user_assessments/') || pathname.includes('evaluations/')) {
    return null
  }

  return (
    !isAnonym ? (
      <PageSider
        logo={logo}
        logoAltText={projectName}
        activeKey={activeItem}
        onMenuSelect={handleMenuSelect}
        items={menuItems}
        siderFooter={siderFooter}
      />
    ) : null
  )
}

export const UserPageSider = connector(UserPageSiderComponent)
