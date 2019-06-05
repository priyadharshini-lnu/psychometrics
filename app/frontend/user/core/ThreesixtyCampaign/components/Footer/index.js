import React from 'react'
import { Layout } from 'antd'
import './styles.scss'

export default function Footer () {
  return (
    <Layout.Footer className="threesixty-footer">
      <div className="fluid-container">
        <div className="footer-wrapper">
          <img className="footer-logo" src={require('user/assets/lighthouseLogo.png')} alt="logo" />
        </div>
      </div>
    </Layout.Footer>
  )
}
