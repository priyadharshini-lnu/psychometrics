import React from 'react'
import { Layout } from 'antd'
import './styles.scss'
import lighthouseLogo from 'user/assets/lighthouseLogo.svg'
import tteLogo from 'user/assets/tteLogo.svg'
import _ from 'lodash'

export default function Footer ({ isFrame, privacyText, privacyPageLink }) {
  if (isFrame) return isFrame

  return (
    <Layout.Footer className="threesixty-footer">
      <div className="fluid-container">
        <div className="footer-wrapper">
          <img src={lighthouseLogo} alt="Lighthouse" />
          <div className="text-align-c">
            <a href="https://thetalententerprise.com/privacy-statement/" target="_blank" rel="noopener noreferrer">
              {I18n.t('shared.tte_terms_and_condition')}
            </a>
            <br />
            {!_.isNull(privacyText) && (
            <a href={privacyPageLink} target="_blank" rel="noopener noreferrer">
              {privacyText}
            </a>
            )}
          </div>
          <img src={tteLogo} alt="The Talent Enterprise" />
        </div>
      </div>
    </Layout.Footer>
  )
}
