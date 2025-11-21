import {
  FC, useEffect, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Drawer, Button,
} from 'antd'
import { useMedia } from 'use-media'
import { useLocation } from 'react-router-dom'
import cs from 'classnames'

import { isRtl } from '~/utils/locales'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { getFeatures } from '~/core/config'
import { DefaultAntThemeWrapper, AccessibleMenu } from '~/glint'
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
    features: getFeatures(state),
  }),
  {
    openSubmenu,
    triggerCollapse,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
  selected?: string[]
}

const { I18n } = window

const MainMenuComponent: FC<Props> = ({
  currentUser,
  hasSubmenu,
  openSubmenu,
  collapsed,
  triggerCollapse,
  links,
  showSubmenu,
  selected,
  features,
}) => {
  const isSmallScreen = useMedia({
    maxWidth: 1024,
  })
  const onSelect = ({ key }): ReturnType<typeof openSubmenu> | void => {
    if (key === 'showSubmenu') {
      return openSubmenu()
    }
  }

  const selectedKey = getSelected()
  const rtl = isRtl(I18n.locale)

  const isContentSubMenuOpen = ['assessments', 'norms',
    'dimensions', 'reports', 'questionCenter', 'libraries'].includes(selectedKey) || false
  const isConfigurationSubMenuOpen = ['skillsTaxonomy',
    'developmentActions', 'aiAssistants', 'campaignTemplates'].includes(selectedKey) || false

  let defaultOpenKeys: string[] = []
  if (isContentSubMenuOpen) {
    defaultOpenKeys = ['content']
  } else if (isConfigurationSubMenuOpen) {
    defaultOpenKeys = ['configuration']
  }

  const menu = (
    <>
      <UserAvatar currentUser={currentUser} collapsed={collapsed} />
      <AccessibleMenu
        theme="light"
        selectedKeys={selected || [getSelected()]}
        mode="inline"
        items={menuItems(links, hasSubmenu, features)}
        onClick={onSelect}
        className={styles.menu}
        style={{ border: 0 }}
        defaultOpenKeys={defaultOpenKeys}
      />
    </>
  )

  const closeMenu = () => {
    triggerCollapse()
    if (hasSubmenu) openSubmenu()
  }

  const isMeet = location.href.match(/\/(meet)/)
  if (isMeet) return null

  return isSmallScreen
    ? (
      <>
        <Button
          onClick={() => triggerCollapse()}
          className={cs(styles.trigger, styles.mobile)}
          aria-label={collapsed ? I18n.t('frontend.aria.expand_menu') : I18n.t('frontend.aria.collapse_menu')}
          type="link"
          icon={collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        />
        <Drawer
          closable={false}
          styles={{
            body: { padding: 0 },
          }}
          placement={rtl ? 'right' : 'left'}
          width={SIDEBAR_WIDTH}
          open={!showSubmenu && !collapsed}
          onClose={() => closeMenu()}
        >
          {menu}
        </Drawer>
      </>
    )
    : (
      <>
        <Button
          onClick={() => triggerCollapse()}
          className={styles.trigger}
          aria-label={collapsed ? I18n.t('frontend.aria.expand_menu') : I18n.t('frontend.aria.collapse_menu')}
          type="link"
          icon={collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        />
        <Layout.Sider
          id="top_sidebar"
          className={styles.sider}
          width={SIDEBAR_WIDTH}
          theme="light"
          collapsed={collapsed}
          collapsedWidth={55}
          onCollapse={() => triggerCollapse()}
        >
          {menu}
        </Layout.Sider>
      </>

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
