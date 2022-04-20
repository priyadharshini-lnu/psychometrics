import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Layout, Row, Col } from 'antd'

import { RootState } from 'modules/user/core/rootReducers'

import {
  getPrivacyText,
  privacyPageLink,
  getSecondaryLogo,
  getName,
} from 'modules/user/modules/campaigns/core/project'
import { isInsideIframe } from 'utils/isInsideIframe'

import lighthouseLogo from 'modules/user/assets/images/lighthouseLogoTall.svg'
import tteLogo from 'modules/user/assets/images/tteLogo.svg'

import styles from './styles.scss'

const { I18n } = window

const mapStateToProps = (state: RootState) => ({
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
  secondaryLogo: getSecondaryLogo(state),
  projectName: getName(state),
})

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

const Footer: FC<PropsFromRedux> = ({
  privacyText,
  privacyPageLink,
  secondaryLogo,
  projectName,
}) => {
  if (isInsideIframe()) {
    return null
  }

  return (
    <Layout.Footer className={styles.footer}>
      <Row align="middle" justify="space-between">
        {secondaryLogo && <TTELogo />}
        <ProductUsageLinks
          privacyText={privacyText}
          privacyPageLink={privacyPageLink}
        />
        <PartnerLogo secondaryLogo={secondaryLogo} projectName={projectName} />
      </Row>
    </Layout.Footer>
  )
}

const TTELogo: FC = () => (
  <img src={tteLogo} alt="The Talent Enterprise" height="50" width="auto" />
)

type ProductsUsageLinksProps = Pick<PropsFromRedux, 'privacyText' | 'privacyPageLink'>

const ProductUsageLinks: FC<ProductsUsageLinksProps> = ({
  privacyText,
  privacyPageLink,
}) => {
  let privacyLink: JSX.Element | null = null
  if (privacyText && privacyPageLink) {
    privacyLink = (
      <Col span="24">
        <a href={privacyPageLink} target="_blank" rel="noopener noreferrer">
          {privacyText}
        </a>
      </Col>
    )
  }

  return (
    <Row align="middle" justify="center" className="ta-c">
      <Col span="24">
        <a
          href="https://thetalententerprise.com/privacy-statement/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('shared.tte_terms_and_condition')}
        </a>
      </Col>
      {privacyLink}
    </Row>
  )
}

type PartnerLogsProps = Pick<PropsFromRedux, 'secondaryLogo' | 'projectName' >

const PartnerLogo: FC<PartnerLogsProps> = ({
  secondaryLogo,
  projectName,
}) => {
  if (secondaryLogo) {
    return (
      <img src={secondaryLogo} alt={projectName} height="50" width="auto" />
    )
  }

  return <img src={lighthouseLogo} alt="Lighthouse" height="50" width="auto" />
}

const FooterConnected = connector(Footer)

export { FooterConnected as default, Footer }
