import React from 'react'
import { Route } from 'react-router-dom'
import {
  Layout, Menu, Icon,
} from 'antd'
import './styles.scss'
import connect from './connect'

const { SubMenu } = Menu

function Navigation ({ logout }) {
  const onLogout = () => {
    logout().then(() => location.reload())
  }
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
              <a href="/">My Projects</a>
            </Menu.Item>

            <SubMenu
              className="align-right"
              title={(
                <span className="submenu-title-wrapper">
                  <Icon type="user" />
                </span>
              )}
            >
              <Menu.Item key="logout" onClick={onLogout}>Logout</Menu.Item>
            </SubMenu>
            <Menu.Item key="app" className="align-right">
              <Icon type="zhihu" />
              Language
            </Menu.Item>
            <Menu.Item key="mail" className="align-right">
              <Icon type="question-circle" />
              Help
            </Menu.Item>
          </Menu>
        )}
      </Route>
    </Layout.Header>
  )
}

export default connect(Navigation)
