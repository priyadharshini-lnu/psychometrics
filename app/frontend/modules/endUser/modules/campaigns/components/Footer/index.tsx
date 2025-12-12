import { FC } from 'react'
import { Button, Space } from 'antd'
import { connect, ConnectedProps } from 'react-redux'


import { RootState } from '~/modules/endUser/core/rootReducers'

import {
  getPrivacyText,
  privacyPageLink,
  getSecondaryLogo,
  getName,
  getSecondaryLogoAltText,
} from '~/modules/endUser/modules/campaigns/core/project'
import lighthouseLogo from '~/assets/tte-logo-no-text-raster.png'
import { useIsProctored } from '~/hooks/useProctoringState'

import { PageFooter } from '~/glint'
import styles from './styles.less'

const { I18n } = window

const mapStateToProps = (state: RootState) => ({
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
  secondaryLogo: getSecondaryLogo(state),
  secondaryLogoAltText: getSecondaryLogoAltText(state),
  projectName: getName(state),
})

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

const FooterComponent: FC<PropsFromRedux> = ({
  privacyText,
  privacyPageLink,
  secondaryLogo,
  projectName,
  secondaryLogoAltText,
}) => {
  const { isProctored } = useIsProctored()
  if (isProctored) { return null }

  return (
    <PageFooter
      footerLeft={secondaryLogo && <TTELogo />}
      footerMiddle={(
        <ProductUsageLinks
          privacyText={privacyText}
          privacyPageLink={privacyPageLink}
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

const TTELogo: FC = () => (
  <img src={lighthouseLogo} alt={I18n.t('shared.mte_logo_alt_text')} className={styles.footerLighthouseLogo} />
)

type ProductsUsageLinksProps = Pick<PropsFromRedux, 'privacyText' | 'privacyPageLink'>

const ProductUsageLinks: FC<ProductsUsageLinksProps> = ({
  privacyText,
  privacyPageLink,
}) => {
  let privacyLink: JSX.Element | null = null
  if (privacyText && privacyPageLink) {
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
    <Space size="large">
      <Button
        className="ps-0 pe-0 white-space-normal"
        type="link"
        href={`/privacy-statement?lang=${I18n.currentLocale()}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {I18n.t('shared.tte_terms_and_condition')}
      </Button>
      {privacyLink}
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

  return <img src={lighthouseLogo} alt={I18n.t('shared.mte_logo_alt_text')} className={styles.footerLighthouseLogo} />
}

export const Footer = connector(FooterComponent)
