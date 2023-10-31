import React, { useContext, FC, useState } from 'react'
import { Layout, Menu, Drawer } from 'antd'
import { SelectInfo } from 'rc-menu/lib/interface'
import cs from 'classnames'

import { MediaQueryContext } from '~/glint'
import { MenuTriggerIcon } from '~/glint/icons'
import styles from './styles.less'

const { Sider } = Layout

type MenuItem = {
  key: string
  label: string
  icon?: React.ReactElement
}

export type SiderMenuItem = MenuItem & {
  children?: MenuItem[]
}

type PageSiderProps = {
  items: SiderMenuItem[]
  logo: string
  logoAltText?: string
  onMenuSelect?: (info: SelectInfo) => void
  siderFooter?: (collapsed: boolean) => React.ReactElement
  activeKey?: string
  onOpenChange?: (openKeys: string[]) => void
  openKeys?: string[]
  onSiderCollapse?: (collapsed: boolean) => void
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
}) => {
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isMobile, isTablet } = useContext(MediaQueryContext)

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
    <Menu
      selectedKeys={[activeKey]}
      className={styles['sider-menu']}
      mode="inline"
      openKeys={openKeys}
      onClick={handleClick}
      onOpenChange={onOpenChange}
      items={items}
    />
  )

  const logoEle = (
    <div className={styles.logoContainer}>
      <img src={logo} className={styles.sidebarLogo} alt={logoAltText} />
    </div>
  )
  const siderTrigger = (
    <div
      className={cs({ [styles['sider-trigger']]: true, [styles['sider-trigger--collapsed']]: menuCollapsed })}
      onClick={handleTrigger}
    >
      <MenuTriggerIcon className={styles.triggerIcon} />
    </div>
  )

  const drawerTrigger = (
    <div className={styles['drawer-trigger']} onClick={handleDrawerVisibility}>
      <MenuTriggerIcon />
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
            className={styles['sider-drawer']}
          >
            <div className={styles.drawerItemsContainer}>
              {logoEle}
              {menu}
              <div className={styles.sidebarFooter}>{siderFooter && siderFooter(menuCollapsed)}</div>
            </div>
          </Drawer>
        </>
      ) : (
        <Sider trigger={null} collapsible collapsed={menuCollapsed} theme="light" style={{ position: 'relative' }}>
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
