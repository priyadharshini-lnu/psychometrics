import React, { useEffect, useState, useRef } from 'react'
import { PageSider } from 'glint'
import { useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  UserOutlined,
  RightSquareOutlined,
} from '@ant-design/icons'

import { history } from 'modules/user/store'

import lighthouseLogo from 'modules/user/assets/images/lighthouseLogoWide.svg'
import styles from './styles.less'

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

const campaignMenuItem = {
  key: 'campaign',
  label: 'Campaign',
  icon: <RightSquareOutlined className={styles.siderIcon} />,
  children: [{ label: 'Tasks', key: 'tasks' }, { label: 'Insights', key: 'insights' }],
}

export const UserPageSider = ({ siderFooter }) => {
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
      newMenuItems = [...newMenuItems.slice(0, 1), campaignMenuItem, ...newMenuItems.slice(1)]
      setMenuItems(newMenuItems)
      location.pathname.includes('insights') ? setActiveItem('insights') : setActiveItem('tasks')
    } else {
      setMenuItems(newMenuItems)
      setActiveItem(location.pathname.slice(1))
    }
  }, [location])

  return (
    <PageSider
      logo={lighthouseLogo}
      activeKey={activeItem}
      onMenuSelect={handleMenuSelect}
      items={menuItems}
      siderFooter={siderFooter}
    />
  )
}
