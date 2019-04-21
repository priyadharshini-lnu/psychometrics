import React from 'react'
import { Route, Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'

export default function Navigation () {
  return (
    <Layout.Header>
      <Route path="/campaigns/:id">
        {({ match }) => (
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item>
              <Link to={match.url}>My Projects</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to={`${match.url}/nominations/1`}>Nominations</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to={`${match.url}/evaluations/1`}>Evaluations</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to={`${match.url}/reports`}>Reports</Link>
            </Menu.Item>

          </Menu>
        )}
      </Route>
    </Layout.Header>
  )
}
