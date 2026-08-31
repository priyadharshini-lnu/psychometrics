import React, {
  useContext, FC, useState, useEffect,
} from 'react'
import {
  Layout, Drawer, Button, GetProp, MenuProps,
} from 'antd'
import { Link } from 'react-router-dom'
import cs from 'classnames'

import { MediaQueryContext, AccessibleMenu } from '~/glint'
import { MenuTriggerIcon } from '~/glint/icons'
import styles from './styles.less'

type SelectInfo = Parameters<GetProp<MenuProps, 'onSelect'>>[0]

const { Sider } = Layout
const { I18n } = window

type MenuItem = {
  key: string
  label: string
  icon?: React.ReactElement
}

export type SiderMenuItem = MenuItem & {
  children?: MenuItem[]
}

export type PageSiderLogoSize = 'default' | 'medium' | 'compact'

type PageSiderProps = {
  items: SiderMenuItem[]
  logo: string
  logoAltText?: string
  logoLinkUrl?: string
  onMenuSelect?: (info: SelectInfo) => void
  siderFooter?: (collapsed: boolean) => React.ReactElement
  activeKey?: string
  onOpenChange?: (openKeys: string[]) => void
  openKeys?: string[]
  onSiderCollapse?: (collapsed: boolean) => void
  showMaintenanceAlert?: boolean
  logoSize?: PageSiderLogoSize
}

export const PageSider: FC<PageSiderProps> = ({
  items,
  logo,
  logoAltText,
  siderFooter,
  onMenuSelect,
  activeKey = '',
  openKeys = [],
  onSiderCollapse,
  onOpenChange,
  logoLinkUrl,
  showMaintenanceAlert = false,
  logoSize = 'default',
}) => {
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bannerHeight, setBannerHeight] = useState(0)
  const { isMobile, isTablet } = useContext(MediaQueryContext)

  useEffect(() => {
    if (!showMaintenanceAlert) return

    const banner = document.getElementById('maintenance-alert-banner')
    if (!banner) return

    const updateHeight = () => setBannerHeight(banner.offsetHeight)
    updateHeight()

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [showMaintenanceAlert])

  const handleTrigger = () => {
    setMenuCollapsed(!menuCollapsed)
    onSiderCollapse && onSiderCollapse(menuCollapsed)
  }
  const handleClick = (info: SelectInfo) => {
    onMenuSelect && onMenuSelect(info)
    if (isMobile || isTablet) {
      setDrawerOpen(false)
    }
  }

  const handleDrawerVisibility = () => {
    setDrawerOpen(!drawerOpen)
  }
  const menu = (
    <AccessibleMenu
      selectedKeys={[activeKey]}
      className={styles['sider-menu']}
      mode="inline"
      openKeys={menuCollapsed ? undefined : openKeys}
      onClick={handleClick}
      onOpenChange={onOpenChange}
      items={items}
    />
  )

  const logoEle = (
    <div className={styles.logoContainer}>
      <Link to={logoLinkUrl || '/'}>
        <img
          src={logo}
          className={cs(styles.sidebarLogo, {
            [styles.sidebarLogoMedium]: logoSize === 'medium',
            [styles.sidebarLogoCompact]: logoSize === 'compact',
          })}
          alt={logoAltText}
        />
      </Link>
    </div>
  )
  const triggerTopStyle = bannerHeight
    ? { top: `calc(${bannerHeight}px + 0.5rem)` } : undefined

  const siderTrigger = (
    <div
      className={cs({
        [styles['sider-trigger']]: true,
        [styles['sider-trigger--collapsed']]: menuCollapsed,
      })}
      style={triggerTopStyle}
      onClick={handleTrigger}
    >
      <Button
        aria-label={menuCollapsed ? I18n.t('frontend.aria.expand_menu') : I18n.t('frontend.aria.collapse_menu')}
        type="link"
        className="ps-0"
        icon={<MenuTriggerIcon className={styles.triggerIcon} />}
      />
    </div>
  )

  const drawerTopStyle = bannerHeight
    ? { top: `calc(${bannerHeight}px + 8px)` } : undefined

  const drawerTrigger = (
    <div
      className={styles['drawer-trigger']}
      style={drawerTopStyle}
      onClick={handleDrawerVisibility}
    >
      <Button
        aria-label={menuCollapsed ? I18n.t('frontend.aria.expand_menu') : I18n.t('frontend.aria.collapse_menu')}
        type="link"
        className="ps-0"
      >
        <MenuTriggerIcon />
      </Button>
    </div>
  )

  return (
    <>
      {isMobile || isTablet ? (
        <>
          {drawerTrigger}
          <Drawer
            open={drawerOpen}
            placement="left"
            onClose={handleDrawerVisibility}
            rootClassName={styles['sider-drawer']}
          >
            <div className={styles.drawerItemsContainer}>
              {logoEle}
              {menu}
              <div className={styles.sidebarFooter}>{siderFooter && siderFooter(menuCollapsed)}</div>
            </div>
          </Drawer>
        </>
      ) : (
        <Sider
          width="12.5rem"
          collapsedWidth="5rem"
          trigger={null}
          collapsible
          collapsed={menuCollapsed}
          theme="light"
          style={{ position: 'relative' }}
        >
          {siderTrigger}
          <div
            className={cs({
              [styles.siderItemsContainer]: true,
              [styles['page-sider--expanded']]: !menuCollapsed,
              [styles['page-sider--collapsed']]: menuCollapsed,
            })}
          >
            {!menuCollapsed && logoEle}
            {menu}
            <div className={styles.sidebarFooter}>{siderFooter && siderFooter(menuCollapsed)}</div>
          </div>
        </Sider>
      )}
    </>
  )
}
