import React from 'react'
import { Route } from 'react-router-dom'
import {
  Layout, Menu, Icon,
} from 'antd'
import './styles.scss'
// import logo from 'user/assets/logo.png'

const { SubMenu } = Menu

export default function Navigation () {
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
              <a href="/">{I18n.t('threesixty.my_projects')}</a>
            </Menu.Item>

            <SubMenu
              className="align-right"
              title={(
                <span className="submenu-title-wrapper">
                  <Icon type="user" />
                </span>
              )}
            >
              <Menu.Item key="setting:1">Profile</Menu.Item>
              <Menu.Divider />
              <Menu.Item key="setting:4">Logout</Menu.Item>
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
