import React, { useContext, FC } from 'react'
import { Layout, Menu, Drawer } from 'antd'
import { SelectEventHandler, SelectInfo } from 'rc-menu/lib/interface'

import { MediaQueryContext } from 'glint/components/GlintProvider'

import styles from './styles.less'

const { Sider } = Layout
const { Item, SubMenu } = Menu

type MenuItem = {
  key: string | number
  label: string
  icon?: React.ReactElement
}

export type UserDetail = {
  userName: string
  profileImgSrc?: string
}

export type SiderMenuItem = MenuItem & {
  children?: MenuItem[]
}

type PageSiderProps = {
  items: SiderMenuItem[]
  collapsed: boolean
  drawerVisible: boolean
  handleDrawer: (visible: boolean) => void
  handleSiderMenuSelect: SelectEventHandler
  logo: string
  siderFooter?: string | React.ReactElement
}

export const PageSider: FC<PageSiderProps> = ({
  items,
  collapsed,
  drawerVisible,
  handleDrawer,
  handleSiderMenuSelect,
  logo,
  siderFooter,
}) => {
  const { isMobile, isTablet } = useContext(MediaQueryContext)

  const handleDrawerClose = () => {
    handleDrawer(false)
  }
  const handleOnSelect = (info: SelectInfo) => {
    handleSiderMenuSelect(info)
  }

  const menu = (
    <Menu mode="inline" onSelect={handleOnSelect} defaultSelectedKeys={['1']}>
      {items.map((eachItem) => {
        if (eachItem.children) {
          return (
            <SubMenu icon={eachItem.icon} title={eachItem.label}>
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
      <img src={logo} className={styles.sidebarLogo} alt="Lighthouse" />
    </div>
  )

  return (
    <>
      {(isMobile || isTablet) ? (
        <Drawer visible={drawerVisible} placement="left" onClose={handleDrawerClose}>
          {logoEle}
          {menu}
          <div className={styles.sidebarFooter}>
            {siderFooter}
          </div>
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ height: '100vh' }}>
          {!collapsed && logoEle}
          {menu}
          <div className={styles.sidebarFooter}>
            {siderFooter}
          </div>
        </Sider>
      )}
    </>
  )
}
