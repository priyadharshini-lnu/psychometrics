import React from 'react'
import { Layout } from 'antd'
import './styles.scss'
import lighthouseLogo from 'user/assets/lighthouseLogo.svg'
import tteLogo from 'user/assets/tteLogo.svg'

export default function Footer ({ isFrame }) {
  if (isFrame) return isFrame

  return (
    <Layout.Footer className="threesixty-footer">
      <div className="fluid-container">
        <div className="footer-wrapper">
          <img src={lighthouseLogo} alt="Lighthouse" />
          <a href="https://thetalententerprise.com/privacy-statement/" target="_blank" rel="noopener noreferrer">
            Terms, Conditions and Privacy Statement
          </a>
          <img src={tteLogo} alt="The Talent Enterprise" />
        </div>
      </div>
    </Layout.Footer>
  )
}
