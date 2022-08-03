import React, {
  useEffect, useState, useRef, FC,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { PageSider } from 'glint'
import { useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  UserOutlined,
  RightSquareOutlined,
} from '@ant-design/icons'

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
const initialMenuItems = [
  {
    key: 'dashboard',
    label: I18n.t('campaign.dashboard_menu.home'),
    icon: <HomeOutlined className={styles.siderIcon} />,
  },
  {
    key: 'profile',
    label: I18n.t('campaign.dashboard_menu.profile'),
    icon: <UserOutlined className={styles.siderIcon} />,
  },
]

const campaignMenuItem = showInsights => ({
  key: 'campaign',
  label: 'Campaign',
  icon: <RightSquareOutlined className={styles.siderIcon} />,
  children: showInsights !== false ? [
    { label: 'Tasks', key: 'tasks' },
    { label: 'Insights', key: 'insights' },
  ] : [{ label: 'Tasks', key: 'tasks' }],
})

const UserPageSiderComponent: FC<UserPageSiderProps> = ({
  showInsights, siderFooter, logo, projectName,
}) => {
  const [activeItem, setActiveItem] = useState('')
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const campaignIdRef = useRef<string>('')
  const handleMenuSelect = (menu) => {
    if (menu.key === 'tasks') {
      return history.push(`/campaigns/${campaignIdRef.current}`)
    }
    if (menu.key === 'insights') {
      return history.push(`/campaigns/${campaignIdRef.current}/${menu.key}`)
    }
    history.push(`/${menu.key}`)
  }
  const location = useLocation()

  useEffect(() => {
    let newMenuItems = initialMenuItems
    if (location.pathname.includes('/campaigns/')) {
      const [,, campaignId] = location.pathname.split('/')
      campaignIdRef.current = campaignId
      newMenuItems = [...newMenuItems.slice(0, 1), campaignMenuItem(showInsights), ...newMenuItems.slice(1)]
      setMenuItems(newMenuItems)
      location.pathname.includes('insights') ? setActiveItem('insights') : setActiveItem('tasks')
    } else {
      setMenuItems(newMenuItems)
      setActiveItem(location.pathname.slice(1))
    }
  }, [location])

  return (
    <PageSider
      logo={logo}
      logoAltText={projectName}
      activeKey={activeItem}
      onMenuSelect={handleMenuSelect}
      items={menuItems}
      siderFooter={siderFooter}
    />
  )
}

export const UserPageSider = connector(UserPageSiderComponent)
