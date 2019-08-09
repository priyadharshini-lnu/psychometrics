import React, { useState } from 'react'
import { Route } from 'react-router-dom'
import {
  Layout, Menu, Icon, Dropdown, Modal,
} from 'antd'
import './styles.scss'
import connect from './connect'
import EditProfileModal from '../EditProfileModal'

const { SubMenu } = Menu

function Navigation ({ changeLocale, logout, logo }) {
  const [showHelp, setShowHelp] = useState(false)
  const [editProfileModalOpen, setEditProfileModal] = useState(false)

  const onLogout = () => {
    logout().then(() => location.reload())
  }

  const langMenu = () => (
    <Menu onClick={({ key }) => { changeLocale(key).then(() => location.reload()) }}>
      <Menu.Item key="en">
        English
      </Menu.Item>
      <Menu.Item key="ar">
        Arabic
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout.Header className="threesixty-navigation" mode="horizontal">
      <Route path="/campaigns/:id">
        {() => (
          <Menu
            mode="horizontal"
            theme="light"
            style={{ lineHeight: '62px' }}
            overflowedIndicator={<Icon type="menu" />}
          >
            <Menu.Item>
              <a href="/">
                {logo
                  ? <img src={logo} alt="logo" className="logo" />
                  : <Icon type="home" />}
              </a>
            </Menu.Item>

            <SubMenu
              className="align-right"
              title={(
                <span className="submenu-title-wrapper">
                  <Icon type="user" />
                </span>
              )}
            >
              <Menu.Item key="profile" onClick={() => { setEditProfileModal(true) }}>Profile</Menu.Item>
              <Menu.Item key="logout" onClick={onLogout}>Logout</Menu.Item>
            </SubMenu>
            <Menu.Item key="app" className="align-right">
              <Dropdown overlay={() => langMenu()} trigger={['click']}>
                <a>
                  <Icon type="global" />
                  {I18n.t('threesixty.language')}
                </a>
              </Dropdown>
            </Menu.Item>
            <Menu.Item key="help" className="align-right" onClick={() => setShowHelp(true)}>
              <Icon type="question-circle" />
              Help
            </Menu.Item>
          </Menu>
        )}
      </Route>
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
        <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: I18n.t('threesixty.help.main') }} />
      </Modal>
      {editProfileModalOpen && <EditProfileModal closeModal={() => setEditProfileModal(false)} />}
    </Layout.Header>
  )
}

export default connect(Navigation)
