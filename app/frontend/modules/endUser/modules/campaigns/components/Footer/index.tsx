import { FC } from 'react'
import { Button, Space } from 'antd'
import { connect, ConnectedProps } from 'react-redux'


import { RootState } from '~/modules/endUser/core/rootReducers'

import {
  getPrivacyText,
  privacyPageLink,
  enablePrivacyLink,
  getSecondaryLogo,
  getName,
  getSecondaryLogoAltText,
} from '~/modules/endUser/modules/campaigns/core/project'
import { monogramHeightPx, monogramNavyUrl } from '~/utils/branding'
import { useIsProctored } from '~/hooks/useProctoringState'

import { PageFooter } from '~/glint'
import { ManageCookiesButton } from '~/components/ManageCookiesButton'
import styles from './styles.less'

const { I18n } = window

const mapStateToProps = (state: RootState) => ({
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
  enablePrivacyLink: enablePrivacyLink(state),
  secondaryLogo: getSecondaryLogo(state),
  secondaryLogoAltText: getSecondaryLogoAltText(state),
  projectName: getName(state),
})

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

const FooterComponent: FC<PropsFromRedux> = ({
  privacyText,
  privacyPageLink,
  enablePrivacyLink,
  secondaryLogo,
  projectName,
  secondaryLogoAltText,
}) => {
  const { isProctored } = useIsProctored()
  if (isProctored) { return null }

  return (
    <PageFooter
      footerLeft={secondaryLogo && <BrandMonogram />}
      footerMiddle={(
        <ProductUsageLinks
          privacyText={privacyText}
          privacyPageLink={privacyPageLink}
          enablePrivacyLink={enablePrivacyLink}
        />
      )}
      footerRight={(
        <PartnerLogo
          secondaryLogo={secondaryLogo}
          secondaryLogoAltText={secondaryLogoAltText}
          projectName={projectName}
        />
      )}
    />
  )
}

const BrandMonogram: FC = () => (
  <img
    alt={I18n.t('shared.mte_logo_alt_text')}
    src={monogramNavyUrl()}
    className={styles.footerLighthouseLogo}
    height={monogramHeightPx()}
  />
)

type ProductsUsageLinksProps = Pick<PropsFromRedux, 'privacyText' | 'privacyPageLink' | 'enablePrivacyLink'>

const ProductUsageLinks: FC<ProductsUsageLinksProps> = ({
  privacyText,
  privacyPageLink,
  enablePrivacyLink,
}) => {
  let privacyLink: JSX.Element | null = null
  if (enablePrivacyLink && privacyText && privacyPageLink) {
    privacyLink = (
      <Button
        className="ps-0 pe-0"
        type="link"
        href={privacyPageLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {privacyText}
      </Button>
    )
  }

  return (
    <Space>
      <Space size="large">
        <Button
          className="ps-0 pe-0 white-space-normal"
          type="link"
          href={`/privacy-statement?lang=${I18n.currentLocale()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('shared.privacy_notice')}
        </Button>
      </Space>
      <Space size="large">
        <Button
          className="ps-0 pe-0 white-space-normal"
          type="link"
          href={`/cookies-statement?lang=${I18n.currentLocale()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('shared.cookie_notice')}
        </Button>
        {privacyLink}
        <ManageCookiesButton />
      </Space>
    </Space>
  )
}

type PartnerLogsProps = Pick<PropsFromRedux, 'secondaryLogo' | 'projectName'> & {
  secondaryLogoAltText: string;
};
const PartnerLogo: FC<PartnerLogsProps> = ({
  secondaryLogo,
  projectName,
  secondaryLogoAltText,
}) => {
  if (secondaryLogo) {
    return (
      <img src={secondaryLogo} alt={secondaryLogoAltText || projectName} className={styles['footer-logo']} />
    )
  }

  return <BrandMonogram />
}

export const Footer = connector(FooterComponent)
