import React from 'react'
import { Route } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import './styles.scss'

export default function Navigation () {
  return (
    <Layout.Header className="threesixty-navigation" style={{ background: '#fff' }}>
      <Route path="/campaigns/:id">
        {() => (
          <Menu
            mode="horizontal"
            theme="light"
            style={{ lineHeight: '62px' }}
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
