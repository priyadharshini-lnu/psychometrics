import { FC, useEffect, useState } from 'react'
import type { MenuProps } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Layout, Menu, Drawer } from 'antd'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import { useMedia } from 'use-media'
import { UserAvatar } from '~/components/UserAvatar'
import styles from './Subnavigation.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import {
  addSubmenu, closeSubmenu, removeSubmenu, triggerCollapse, openSubmenu,
} from '~/modules/admin/core/ui/menu'
import { camelizeKeys } from '~/utils/object'
import { BACKQUOTE } from '~/utils/keyCodes'
import { SIDEBAR_WIDTH } from '~/constants/sidebar'

type MenuItem = Required<MenuProps>['items'][number];

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: camelizeKeys(getCurrentUser(state)),
    showSubmenu: state.ui.menu.showSubmenu,
    collapsed: state.ui.menu.collapsed,

  }),
  {
    addSubmenu, closeSubmenu, removeSubmenu, triggerCollapse, openSubmenu,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter> & {
  items: MenuItem[]
  selectedKeys: string[]
  onSelect?: (key:string) => void
  showBack?: boolean
}

export const SubnavigationComponent:FC<PropsFromRedux> = ({
  currentUser, items, selectedKeys, onSelect, showBack = true,
  showSubmenu, addSubmenu, closeSubmenu, removeSubmenu, collapsed, triggerCollapse, openSubmenu,
}) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    addSubmenu()

    return () => {
      removeSubmenu()
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') { return }

      if (e.keyCode === BACKQUOTE) {
        showSubmenu ? closeSubmenu() : openSubmenu()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showSubmenu])

  useEffect(() => {
    if (!show && collapsed) {
      setShow(true)
    }
  }, [collapsed])

  const isMobile = useMedia({
    maxWidth: 1024,
  })


  const handleOnSelect = ({ key }): ReturnType<typeof closeSubmenu> | void => {
    if (key === 'back_to_main_menu') {
      return closeSubmenu()
    }
    onSelect?.(key)
  }

  const itemsWithBack = [showBack ? {
    key: 'back_to_main_menu',
    label: I18n.t('administration.navigation.back_to_main'),
    icon: <ArrowLeftOutlined />,
  } : null, ...items]

  const menu = (
    <>
      <UserAvatar currentUser={currentUser} collapsed={collapsed} />
      <Menu
        onSelect={handleOnSelect}
        selectedKeys={selectedKeys}
        mode="inline"
        items={itemsWithBack}
        className={styles.menu}
        style={{ border: 0 }}
      />
    </>
  )

  const closeMenu = () => {
    triggerCollapse()
  }

  return isMobile ? (
    <Drawer
      closable={false}
      styles={{
        body: { padding: 0 },
      }}
      placement="left"
      width={SIDEBAR_WIDTH}
      open={showSubmenu && !collapsed}
      onClose={() => closeMenu()}
    >
      {menu}
    </Drawer>
  ) : (
    <Layout.Sider
      width={SIDEBAR_WIDTH}
      theme="light"
      collapsed={collapsed}
      collapsedWidth={55}
      className={cs(styles.sidebar, { [styles.show]: showSubmenu, [styles.hide]: !showSubmenu })}
    >
      {menu}
    </Layout.Sider>
  )
}

export const Subnavigation = connecter(SubnavigationComponent)
