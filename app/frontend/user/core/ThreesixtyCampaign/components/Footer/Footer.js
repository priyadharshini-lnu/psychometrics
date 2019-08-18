import React from 'react'
import { Layout } from 'antd'
import './styles.scss'
import logo from 'user/assets/lighthouseLogo.png'

export default function Footer ({ isFrame }) {
  if (isFrame) return isFrame

  return (
    <Layout.Footer className="threesixty-footer">
      <div className="fluid-container">
        <div className="footer-wrapper">
          <img className="footer-logo" src={logo} alt="logo" />
        </div>
      </div>
    </Layout.Footer>
  )
}
