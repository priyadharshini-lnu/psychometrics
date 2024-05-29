import { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Menu, Drawer,
} from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import { useMedia } from 'use-media'
import cs from 'classnames'
import { useLocation } from 'react-router-dom'
import { DefaultAntThemeWrapper } from '~/glint'
import { Portal } from './PortalMenu'
import styles from './MainMenu.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import { camelizeKeys } from '~/utils/object'
import { openSubmenu, triggerCollapse } from '~/modules/admin/core/ui/menu'
import { UserAvatar } from '~/components/UserAvatar'
import { SIDEBAR_WIDTH } from '~/constants/sidebar'
import { getSelected, menuItems } from './MenuItems'

const connecter = connect(
  (state: RootState) => ({
    currentUser: camelizeKeys(getCurrentUser(state)),
    links: state.ui.menu.links,
    hasSubmenu: state.ui.menu.hasSubmenu,
    showSubmenu: state.ui.menu.showSubmenu,
    collapsed: state.ui.menu.collapsed,
  }),
  {
    openSubmenu, triggerCollapse,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
    selected?: string[]
}

const MainMenuComponent:FC<Props> = ({
  currentUser, hasSubmenu, openSubmenu, collapsed, triggerCollapse, links,
  showSubmenu, selected,
}) => {
  const isMobile = useMedia({
    maxWidth: 1024,
  })
  const onSelect = ({ key }): ReturnType<typeof openSubmenu> | void => {
    if (key === 'showSubmenu') {
      return openSubmenu()
    }
  }

  const menu = (
    <>
      <UserAvatar currentUser={currentUser} collapsed={collapsed} />
      <Menu
        theme="light"
        selectedKeys={selected || [getSelected()]}
        mode="inline"
        items={menuItems(links, hasSubmenu)}
        onClick={onSelect}
        className={styles.menu}
        style={{ border: 0 }}
      />
    </>
  )

  const closeMenu = () => {
    triggerCollapse()
    if (hasSubmenu) openSubmenu()
  }

  const isMeet = location.href.match(/\/(meet)/)
  if (isMeet) return null

  return isMobile
    ? (
      <>
        <div
          onClick={() => triggerCollapse()}
          className={cs(styles.trigger, styles.mobile, { [styles.open]: !collapsed })}
        >
          {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
        <Drawer
          closable={false}
          styles={{
            body: { padding: 0 },
          }}
          placement="left"
          width={SIDEBAR_WIDTH}
          open={!showSubmenu && !collapsed}
          onClose={() => closeMenu()}
        >
          {menu}
        </Drawer>
      </>
    )
    : (
      <Layout.Sider
        id="top_sidebar"
        className={styles.sider}
        width={SIDEBAR_WIDTH}
        theme="light"
        collapsed={collapsed}
        collapsedWidth={55}
        onCollapse={() => triggerCollapse()}
      >
        <div onClick={() => triggerCollapse()} className={styles.trigger}>
          {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
        {menu}
      </Layout.Sider>
    )
}

// This is for external use outside react app, once everything is moved to react
// we should remove portal and associated code
export const MainMenuInternal = connecter(MainMenuComponent)

// This is for internal use inside react app
export const Main = () => {
  const { pathname } = useLocation()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setSelected([getSelected()])
  }, [pathname])

  return (
    <MainMenuInternal selected={selected} />
  )
}

// Current blocker for not being able to use menu without portal are
// notification banners like "you are already signed in"
// so we need to use portal for now, create a plan to move logout and notification to react app.

export const MainMenu = () => {
  const node = document.getElementById('main_menu')

  return (
    <DefaultAntThemeWrapper>
      <Portal Component={Main} container={node} />
    </DefaultAntThemeWrapper>
  )
}
