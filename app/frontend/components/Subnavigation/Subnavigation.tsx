import { FC, useEffect } from 'react'
import type { MenuProps } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Layout, Menu } from 'antd'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import { UserMenu } from '~/components/MainMenu/MainMenu'
import styles from './Subnavigation.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import { addSubmenu, closeSubmenu, removeSubmenu } from '~/modules/admin/core/ui/menu'

type MenuItem = Required<MenuProps>['items'][number];

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
    showSubmenu: state.ui.menu.showSubmenu,
    collapsed: state.ui.menu.collapsed,
  }),
  {
    addSubmenu, closeSubmenu, removeSubmenu,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter> & {
  items: MenuItem[]
  selectedKeys: string[]
  onSelect: (key:string) => void
  showBack?: boolean
}

export const SubnavigationComponent:FC<PropsFromRedux> = ({
  currentUser, items, selectedKeys, onSelect, showBack = true,
  showSubmenu, addSubmenu, closeSubmenu, removeSubmenu, collapsed,
}) => {
  useEffect(() => {
    addSubmenu()
    return () => {
      removeSubmenu()
    }
  }, [])

  const handleOnSelect = ({ key }): ReturnType<typeof closeSubmenu> | void => {
    if (key === 'back_to_main_menu') {
      return closeSubmenu()
    }
    onSelect(key)
  }

  const itemsWithBack = [showBack ? {
    key: 'back_to_main_menu',
    label: I18n.t('administration.navigation.back_to_main'),
    icon: <ArrowLeftOutlined />,
  } : null, ...items]

  return (
    <Layout.Sider
      width={220}
      theme="light"
      collapsed={collapsed}
      collapsedWidth={55}
      className={cs(styles.sidebar, { [styles.show]: showSubmenu, [styles.hide]: !showSubmenu })}
    >
      <UserMenu currentUser={currentUser} collapsed={collapsed} />
      <Menu
        onSelect={handleOnSelect}
        selectedKeys={selectedKeys}
        mode="inline"
        items={itemsWithBack}
      />
    </Layout.Sider>
  )
}

export const Subnavigation = connecter(SubnavigationComponent)
