import React from 'react'
import { Route, Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'

export default function Navigation () {
  return (
    <Layout.Header style={{ background: '#fff' }}>
      <Route path="/campaigns/:id">
        {({ match }) => (
          <Menu
            mode="horizontal"
            theme="light"
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item>
              <a href="/">My Projects</a>
            </Menu.Item>
          </Menu>
        )}
      </Route>
    </Layout.Header>
  )
}
