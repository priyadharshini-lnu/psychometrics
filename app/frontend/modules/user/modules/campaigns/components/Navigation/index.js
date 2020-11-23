/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import {
  Layout, Menu, Modal, ConfigProvider,
} from 'antd'
import {
  HomeOutlined, MenuOutlined, QuestionCircleOutlined,
} from '@ant-design/icons'
import LangDropdown from 'components/LangDropdown'
import cs from 'classnames'
import { isRtl } from 'utils/locales'
import styles from './styles.scss'
import connect from './connect'
import EditProfileModal from '../EditProfileModal'

const { SubMenu } = Menu

const pagesToHideLangSelection = ['/pass', '/anonym', '/evaluations']

function Navigation ({
  logout, logo, isFrame, isAnonym,
}) {
  if (isFrame) return null

  const [showHelp, setShowHelp] = useState(false)
  const [editProfileModalOpen, setEditProfileModal] = useState(false)
  const hideLangDropdown = !!_.find(pagesToHideLangSelection, page => location.href.includes(page))

  const onLogout = () => {
    logout().then(() => location.reload())
  }
  const rtl = isRtl(I18n.currentLocale())

  return (
    <Layout.Header className="threesixty-navigation" mode="horizontal">
      <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
        <>
          <div className="logo-wrap" key="logo">
            <a href="/">
              {logo
                ? <img src={logo} alt="logo" className="logo" />
                : <HomeOutlined />}
            </a>
          </div>
          <Menu
            key="menu"
            mode="horizontal"
            theme="light"
            style={{ lineHeight: '79px', height: '79px' }}
            overflowedIndicator={<MenuOutlined className="overflow-menu-item align-right" />}
          >
            {!isAnonym && (
            <SubMenu
              className="align-right"
              title={(
                <span className="submenu-title-wrapper">
                  <MenuOutlined className={styles.userIcon} />
                </span>
                    )}
            >
              <Menu.Item key="profile" onClick={() => { setEditProfileModal(true) }}>Profile</Menu.Item>
              <Menu.Item key="logout" onClick={onLogout}>Logout</Menu.Item>
            </SubMenu>
            )}
            <Menu.Item key="app" className={cs('align-right', { hidden: hideLangDropdown })}>
              <LangDropdown locales={I18n.availableLocales} current={I18n.currentLocale()} />
            </Menu.Item>
            <Menu.Item key="help" className="align-right hidden" onClick={() => setShowHelp(true)}>
              <QuestionCircleOutlined />
                  Help
            </Menu.Item>
          </Menu>
        </>
        <Modal
          title={(
            <div className="help-modal-header">
              {I18n.t('threesixty.help')}
            </div>
          )}
          visible={showHelp}
          onCancel={() => setShowHelp(false)}
          footer={null}
        >
          <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: I18n.t('threesixty.helps.main') }} />
        </Modal>
        {editProfileModalOpen && <EditProfileModal closeModal={() => setEditProfileModal(false)} />}
      </ConfigProvider>
    </Layout.Header>
  )
}

export default connect(Navigation)
