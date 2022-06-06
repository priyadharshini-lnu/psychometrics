import React, { useState, FC, useMemo } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import {
  Layout, Menu, Modal, Avatar, Row, Col,
} from 'antd'
import {
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { SafeHTML } from 'components/SafeHTML'

import { RootState } from 'modules/user/core/rootReducers'

import {
  getLogo,
  getName as getProjectName,
} from 'modules/user/modules/campaigns/core/project'
import { get as getCurrentUser, changeLocale } from 'core/currentUser'
import { isInsideIframe } from 'utils/isInsideIframe'
import EditProfileModal from '../EditProfileModal'
import { LocaleSwitcherSubmenu } from './components/LocaleSwitcherSubmenu'

import styles from './styles.less'

const mapStateToProps = (state: RootState) => ({
  logo: getLogo(state),
  projectName: getProjectName(state),
  isAnonym: getCurrentUser(state).isAnonym,
})

const mapDispatchToProps = {
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
  isAnonym,
  changeLocale,
}) => {
  if (isInsideIframe()) {
    return null
  }

  const [activeMenuKey, changeActiveMenuKey] = useState<string[]>([])
  const [isHelpModalOpen, toggleHelpModalTo] = useState(false)
  const [isProfileModalOpen, toggleProfileModalTo] = useState(false)

  const { pathname } = useLocation()
  const [isLocaleLoading, toggleLocaleLoadingTo] = useState(false)

  const currentLocale: string = I18n.currentLocale()
  const locales: string[] = I18n.availableLocales

  const localesWithoutCurrentLocale = locales.filter(
    locale => locale !== currentLocale,
  )

  const PAGES_TO_HIDE_LOCALE_SWITCHER = [
    '/pass', '/anonym', '/evaluations', '/agile_user_assessments', '/user_assessments',
  ]
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

  const handleLogout = () => {
    window.location.href = '/users/sign_out'
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
        <Col lg={12} md={3}>
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
            className="justify-end"
          >
            {(isLocaleSwitcherHidden || localesWithoutCurrentLocale.length === 0) ? null : (
              <LocaleSwitcherSubmenu
                isLocaleLoading={isLocaleLoading}
                handleLocaleChange={handleLocaleChange}
              />
            )}

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
  handleLogout: () => void
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
