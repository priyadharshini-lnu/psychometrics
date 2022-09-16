import React, { useContext, FC, useState } from 'react'
import { Layout, Menu, Drawer } from 'antd'
import { SelectInfo } from 'rc-menu/lib/interface'
import cs from 'classnames'

import { MediaQueryContext } from 'glint'
import { MenuTriggerIcon } from 'glint/icons'
import styles from './styles.less'

const { Sider } = Layout
const { Item, SubMenu } = Menu

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
  openKey?: string
  onSiderCollapse?: (collapsed: boolean) => void
}

export const PageSider: FC<PageSiderProps> = ({
  items,
  logo,
  logoAltText,
  siderFooter,
  onMenuSelect,
  activeKey = '',
  openKey = '',
  onSiderCollapse,
}) => {
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const { isMobile, isTablet } = useContext(MediaQueryContext)

  const handleTrigger = () => {
    setMenuCollapsed(!menuCollapsed)
    onSiderCollapse && onSiderCollapse(menuCollapsed)
  }
  const handleClick = (info: SelectInfo) => {
    onMenuSelect && onMenuSelect(info)
    if (isMobile || isTablet) {
      setDrawerVisible(false)
    }
  }

  const handleDrawerVisibility = () => {
    setDrawerVisible(!drawerVisible)
  }
  const menu = (
    <Menu
      selectedKeys={[activeKey]}
      className={styles['sider-menu']}
      mode="inline"
      defaultOpenKeys={[openKey]}
      onClick={handleClick}
    >
      {items.map((eachItem) => {
        if (eachItem.children) {
          return (
            <SubMenu key={eachItem.key} icon={eachItem.icon} title={eachItem.label}>
              {eachItem.children.map(menuItem => (
                <Item key={menuItem.key} icon={menuItem.icon}>
                  {menuItem.label}
                </Item>
              ))}
            </SubMenu>
          )
        }
        return (
          <Item key={eachItem.key} icon={eachItem.icon}>
            {eachItem.label}
          </Item>
        )
      })}
    </Menu>
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
            visible={drawerVisible}
            placement="left"
            onClose={handleDrawerVisibility}
            className={styles['sider-drawer']}
          >
            {logoEle}
            {menu}
            <div className={styles.sidebarFooter}>{siderFooter && siderFooter(menuCollapsed)}</div>
          </Drawer>
        </>
      ) : (
        <Sider trigger={null} collapsible collapsed={menuCollapsed} theme="light" style={{ position: 'relative' }}>
          {siderTrigger}
          <div
            className={cs({
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
