import React, {
  useRef, FC, useState, useEffect,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  ReadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'


import lighthouseLogo from '~/assets/lighthouseLogoTall.png'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  getProjectLogo,
  getName as getProjectName,
  getLogoAltText,
} from '~/modules/endUser/modules/campaigns/core/project'
import {
  getShowBookings,
} from '~/modules/endUser/core/config'

import { CampaignIcon } from '~/glint/icons'
import { PageSider } from '~/glint'
import styles from './styles.less'
import { getFeatures } from '~/core/config'

const connector = connect((state: RootState) => ({
  logo: getProjectLogo(state),
  projectName: getProjectName(state),
  showBookings: getShowBookings(state),
  features: getFeatures(state),
  logoAltText: getLogoAltText(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>
type UserPageSiderProps = {
  showInsights: boolean
  siderFooter: (collapsed: boolean) => React.ReactElement
  updateProfileRequired: boolean
  showBookings?: boolean
  features?: boolean
} & PropsFromRedux

const { I18n } = window

const getMenuItems = (
  showCampaign?: boolean,
  showInsights?: boolean,
  showBookings?: boolean,
  idpEnabled?: boolean,
) => ([{
  key: 'dashboard',
  label: I18n.t('campaign.dashboard_menu.home'),
  icon: <HomeOutlined className={styles.siderIcon} />,
},
...showCampaign ? [{
  key: 'campaign',
  label: I18n.t('campaign.dashboard_menu.campaign'),
  icon: <CampaignIcon aria-label="campaign" className={styles.siderIcon} />,
  children: showInsights !== false ? [
    { label: I18n.t('campaign.dashboard_menu.tasks'), key: 'tasks' },
    { label: I18n.t('campaign.dashboard_menu.insights'), key: 'insights' },
  ] : [{ label: I18n.t('campaign.dashboard_menu.tasks'), key: 'tasks' }],
}] : [],
// eslint-disable-next-line no-constant-condition
...idpEnabled ? [{
  key: 'idp',
  label: I18n.t('campaign.dashboard_menu.development'),
  icon: <ReadOutlined className={styles.siderIcon} />,
  children: [
    { label: I18n.t('campaign.dashboard_menu.my_plan'), key: 'my_plan' },
    { label: I18n.t('campaign.dashboard_menu.direct_reportees'), key: 'direct_reportees' },
  ],
}] : [],
...showBookings ? [{
  key: 'invites',
  label: I18n.t('campaign.dashboard_menu.bookings'),
  icon: <CalendarOutlined className={styles.siderIcon} />,
}] : [],
{
  key: 'profile',
  label: I18n.t('campaign.dashboard_menu.profile'),
  icon: <UserOutlined className={styles.siderIcon} />,
  children: [
    { label: I18n.t('campaign.dashboard_menu.profile_details'), key: 'profile_details' },
    { label: I18n.t('campaign.dashboard_menu.change_password'), key: 'change_password' },
  ],
}])

const UserPageSiderComponent: FC<UserPageSiderProps> = ({
  showInsights, siderFooter, logo, projectName, updateProfileRequired, showBookings, features, logoAltText,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { pathname } = location
  let menuItems = getMenuItems(false, false, showBookings, features?.idp_enabled)
  let activeItem:string
  const campaignIdRef = useRef<string>('')
  const isAnonym = pathname.includes('/anonym/')
  const isThreesixty = pathname.includes('/threesixty_campaigns/')
  const siderLogo = logo || lighthouseLogo
  const [openKey, setOpenKey] = useState<string[]>([])

  useEffect(() => {
    if (pathname.includes('/campaigns/')) {
      setOpenKey([...openKey, 'campaign'])
    }
    if (pathname.includes('/profile_details') || pathname.includes('/change_password')) {
      setOpenKey([...openKey, 'profile'])
    }
    if (pathname.includes('/idp/')) {
      setOpenKey([...openKey, 'idp'])
    }
  }, [pathname])
  const handleMenuSelect = (menu) => {
    if (menu.key === 'steps') { // TODO: remove after implementation
      return navigate('/idp/steps/getting_started')
    }
    if (menu.key === 'my_plan') {
      return navigate('/idp/my_plan')
    }
    if (menu.key === 'direct_reportees') {
      return navigate('/idp/direct_reportees')
    }
    if (menu.key === 'tasks') {
      const routePrefix = isThreesixty ? 'threesixty_campaigns' : 'campaigns'
      return navigate(`/${routePrefix}/${campaignIdRef.current}`)
    }
    if (menu.key === 'insights') {
      return navigate(`/campaigns/${campaignIdRef.current}/${menu.key}`)
    }
    navigate(`/${menu.key}`)
  }

  const handleOpenChange = (openKeys: string[]) => {
    setOpenKey(openKeys)
  }

  if (pathname.includes('/campaigns/') || isThreesixty) {
    const [,, campaignId] = location.pathname.split('/')
    campaignIdRef.current = campaignId
    menuItems = getMenuItems(
      true,
      pathname.includes('/threesixty_campaigns/') ? false : showInsights,
      showBookings,
      features?.idp_enabled,
    )
    activeItem = pathname.includes('insights') ? 'insights' : 'tasks'
  } else if (pathname.includes('/idp/')) {
    // destructuring is not required here as we are dealing with single entity
    // eslint-disable-next-line prefer-destructuring
    activeItem = pathname.split('/')[2]
  } else {
    activeItem = pathname.slice(1)
    activeItem = pathname.includes('invites') ? 'invites' : activeItem
    activeItem = pathname === '/profile' ? 'profile_details' : activeItem
    activeItem = activeItem || 'dashboard'
  }

  if (pathname.includes('user_assessments/') || pathname.includes('evaluations/') || pathname.includes('/meet/')) {
    return null
  }

  if (updateProfileRequired) {
    menuItems = menuItems.filter(menuItem => menuItem.key === 'profile')
  }

  return (
    !isAnonym ? (
      <PageSider
        logo={siderLogo}
        logoAltText={logoAltText || projectName}
        activeKey={activeItem}
        onMenuSelect={handleMenuSelect}
        items={menuItems}
        siderFooter={siderFooter}
        openKeys={openKey}
        onOpenChange={handleOpenChange}
      />
    ) : null
  )
}

export const UserPageSider = connector(UserPageSiderComponent)
