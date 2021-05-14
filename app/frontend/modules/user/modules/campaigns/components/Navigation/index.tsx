import React, { useState, FC, useMemo } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import {
  Layout, Menu, Modal, Avatar, Row, Col,
} from 'antd'
import {
  MenuOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import { SafeHTML } from 'components/SafeHTML'

import { RootState } from 'modules/user/core/rootReducers'

import {
  getLogo,
  getName as getProjectName,
} from 'modules/user/modules/campaigns/core/project'
import { get as getConfig } from 'modules/user/core/config'
import { logout, get as getCurrentUser, changeLocale } from 'core/currentUser'

import EditProfileModal from '../EditProfileModal'
import { LocaleSwitcherSubmenu } from './components/LocaleSwitcherSubmenu'

import styles from './styles.scss'

const mapStateToProps = (state: RootState) => ({
  logo: getLogo(state),
  projectName: getProjectName(state),
  isFrame: getConfig(state).isFrame,
  isAnonym: getCurrentUser(state).isAnonym,
})

const mapDispatchToProps = {
  logout,
  changeLocale,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

const { I18n } = window

enum ModalKeys {
  HELP = 'modal-help',
  PROFILE = 'modal-profile',
}

enum ModalVisibiltyStates {
  OPEN = 'open',
  CLOSE = 'close',
}

const Navigation: FC<PropsFromRedux> = ({
  logo,
  projectName,
  isFrame,
  isAnonym,
  logout,
  changeLocale,
}) => {
  if (isFrame) {
    return null
  }

  const [activeMenuKey, changeActiveMenuKey] = useState<string[]>([])
  const [isHelpModalOpen, toggleHelpModalTo] = useState(false)
  const [isProfileModalOpen, toggleProfileModalTo] = useState(false)

  const { pathname } = useLocation()
  const [isLocaleLoading, toggleLocaleLoadingTo] = useState(false)

  const PAGES_TO_HIDE_LOCALE_SWITCHER = ['/pass', '/anonym', '/evaluations', '/agile_user_assessments']
  const isLocaleSwitcherHidden = useMemo(
    () => PAGES_TO_HIDE_LOCALE_SWITCHER.some(
      pageToHideLangSelection => pathname.startsWith(pageToHideLangSelection),
    ),
    [pathname],
  )

  const handleLocaleChange = async (localeKey: string): Promise<void> => {
    toggleLocaleLoadingTo(true)

    await changeLocale(localeKey)
    location.reload()
  }

  const toggleModalVisibility = (
    modalKey: string,
    modalVisibilityState: string,
  ): void => {
    if (isLocaleLoading) {
      return
    }

    const shouldModalBeMadeVisible = modalVisibilityState === ModalVisibiltyStates.OPEN

    if (shouldModalBeMadeVisible === false) {
      // clear menu selection on modal close
      changeActiveMenuKey([])
    }

    if (modalKey === ModalKeys.PROFILE) {
      toggleProfileModalTo(shouldModalBeMadeVisible)
    } else if (modalKey === ModalKeys.HELP) {
      toggleHelpModalTo(shouldModalBeMadeVisible)
    }
  }

  const handleLogout = async (): Promise<void> => {
    await logout()
    location.reload()
  }

  return (
    <Layout.Header className={styles.header}>
      <Row justify="space-between" align="middle">
        <Col>
          <Link to="/">
            {logo
              ? (
                <img
                  src={logo}
                  alt={projectName}
                  // reason for inline style -> LH-1187
                  style={{
                    maxHeight: '70px',
                    maxWidth: '100%',
                  }}
                  loading="eager"
                />
              )
              : (
                <>
                  {projectName}
                </>
              )
          }
          </Link>
        </Col>
        <Col flex="1 1 auto">
          <Menu
            key="menu"
            mode="horizontal"
            theme="light"
            overflowedIndicator={
              <MenuOutlined className={styles.menuItemIcons} />
            }
            triggerSubMenuAction="click"
            selectedKeys={activeMenuKey}
            onClick={({ key }) => changeActiveMenuKey([`${key}`])}
            className="ta-e"
          >
            <LocaleSwitcherSubmenu
              isLocaleLoading={isLocaleLoading}
              isLocaleSwitcherHidden={isLocaleSwitcherHidden}
              handleLocaleChange={handleLocaleChange}
            />

            <Menu.Item
              key="help"
              onClick={() => toggleModalVisibility(ModalKeys.HELP, ModalVisibiltyStates.OPEN)
              }
              title={I18n.t('navigation.help')}
              className={cs(styles.menuItemIcons, 'hidden')}
            >
              <QuestionCircleOutlined />
            </Menu.Item>

            <ProfileSubmenu
              isAnonym={isAnonym}
              toggleModalVisibility={toggleModalVisibility}
              handleLogout={handleLogout}
            />
          </Menu>
        </Col>
      </Row>

      {isHelpModalOpen && (
        <Modal
          title={(
            <div className="help-modal-header">
              {I18n.t('threesixty.assesment.modals.help.title')}
            </div>
          )}
          visible={isHelpModalOpen}
          onCancel={() => toggleModalVisibility(ModalKeys.HELP, ModalVisibiltyStates.CLOSE)
          }
          footer={null}
        >
          <SafeHTML html={I18n.t('threesixty.assesment.modals.help.body')} />
        </Modal>
      )}

      {isProfileModalOpen && (
        <EditProfileModal
          closeModal={() => toggleModalVisibility(ModalKeys.PROFILE, ModalVisibiltyStates.CLOSE)
          }
        />
      )}
    </Layout.Header>
  )
}

interface ProfileSubmenuProps {
  toggleModalVisibility: (
    modalKey: string,
    modalVisibilityState: string
  ) => void
  handleLogout: () => Promise<void>
}

const ProfileSubmenu: FC<
  ProfileSubmenuProps & Pick<PropsFromRedux, 'isAnonym'>
> = ({
  isAnonym, toggleModalVisibility, handleLogout, ...restMenuProps
}) => {
  if (isAnonym) {
    return null
  }

  return (
    <Menu.SubMenu
      key="profile-submenu"
      className={styles.profileMenu}
      title={
        <Avatar icon={<UserOutlined className={styles.overideMargin} />} />
      }
      {...restMenuProps}
    >
      <Menu.Item
        key="profile"
        onClick={() => toggleModalVisibility(ModalKeys.PROFILE, ModalVisibiltyStates.OPEN)
        }
      >
        {I18n.t('navigation.profile')}
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        {I18n.t('navigation.logout')}
      </Menu.Item>
    </Menu.SubMenu>
  )
}

const NavigationConnected = connector(Navigation)

export { NavigationConnected as default, Navigation }
