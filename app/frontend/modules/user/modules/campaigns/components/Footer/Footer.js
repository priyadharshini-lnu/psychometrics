import React from 'react'
import { Layout } from 'antd'
import './styles.scss'
import lighthouseLogo from 'modules/user/assets/images/lighthouseLogo.svg'
import tteLogo from 'modules/user/assets/images/tteLogo.svg'
import { isNull } from 'lodash'

export default function Footer ({
  isFrame, privacyText, privacyPageLink, secondaryLogo, projectName,
}) {
  if (isFrame) return isFrame

  return (
    <Layout.Footer className="threesixty-footer">
      <div className="fluid-container">
        <div className="footer-wrapper">
          <div className="content">
            <div className="tte-logo">
              <img src={tteLogo} alt="The Talent Enterprise" height="52" />
            </div>
            <div className="links">
              <a href="https://thetalententerprise.com/privacy-statement/" target="_blank" rel="noopener noreferrer">
                {I18n.t('shared.tte_terms_and_condition')}
              </a>
              {!isNull(privacyText) && (
                <a href={privacyPageLink} target="_blank" rel="noopener noreferrer">
                  {privacyText}
                </a>
              )}
            </div>
            <div className="partner-logo">
              {secondaryLogo
                ? <img src={secondaryLogo} alt={projectName} height="52" />
                : <img src={lighthouseLogo} alt="Lighthouse" height="52" />
              }
            </div>
          </div>
        </div>
      </div>
    </Layout.Footer>
  )
}
