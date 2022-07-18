import React, { useContext, FC, useState } from 'react'
import { Layout, Menu, Drawer } from 'antd'
import { SelectInfo } from 'rc-menu/lib/interface'

import { MediaQueryContext } from 'glint/components/GlintProvider'

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
  collapsed: boolean
  drawerVisible: boolean
  onDrawerVisiblityChange: (visible: boolean) => void
  logo: string
  onMenuClick?: (info: SelectInfo) => void
  siderFooter?: (collapsed: boolean) => React.ReactElement

}

export const PageSider: FC<PageSiderProps> = ({
  items,
  collapsed,
  drawerVisible,
  onDrawerVisiblityChange,
  logo,
  siderFooter,
  onMenuClick,
}) => {
  const [activeKey, setActiveKey] = useState('')
  const { isMobile, isTablet } = useContext(MediaQueryContext)

  const handleClick = (info: SelectInfo) => {
    onMenuClick && onMenuClick(info)
    setActiveKey(info.key)
    if (isMobile || isTablet) {
      onDrawerVisiblityChange(false)
    }
  }

  const menu = (
    <Menu
      activeKey={activeKey}
      className={styles['sider-menu']}
      mode="inline"
      onClick={handleClick}
      defaultSelectedKeys={[items[0].key]}
    >
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
        <Drawer
          visible={drawerVisible}
          placement="left"
          onClose={() => onDrawerVisiblityChange(false)}
          className={styles['sider-drawer']}
        >
          {logoEle}
          {menu}
          <div className={styles.sidebarFooter}>
            {siderFooter && siderFooter(collapsed)}
          </div>
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ height: '100vh' }}>
          {!collapsed && logoEle}
          {menu}
          <div className={styles.sidebarFooter}>
            {siderFooter && siderFooter(collapsed)}
          </div>
        </Sider>
      )}
    </>
  )
}
