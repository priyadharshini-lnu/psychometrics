import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Flex, Typography } from '@thetalententerprise/glint'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { getPrivacyText, privacyPageLink, enablePrivacyLink } from '~/modules/endUser/modules/campaigns/core/project'
import { useManageCookies } from '~/hooks/useManageCookies'
import { displayName } from '~/utils/branding'

const { I18n } = window

// Quiet legal links per the Folio footer: small text links, not buttons.
const LINK_STYLE = { fontSize: 'var(--ant-font-size-sm)' as const }

const connector = connect((state: RootState) => ({
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
  isPrivacyLinkEnabled: enablePrivacyLink(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

// The signed-in page footer: hairline divider, copyright start-aligned, legal
// links end-aligned as quiet text links.
const PageFooterComponent: FC<PropsFromRedux> = ({ privacyText, privacyPageLink, isPrivacyLinkEnabled }) => {
  const year = new Date().getFullYear()
  const manageCookies = useManageCookies()

  const projectPrivacyLink = isPrivacyLinkEnabled ? (
    <Typography.Link
      href={privacyPageLink}
      target="_blank"
      rel="noopener noreferrer"
      style={LINK_STYLE}
    >
      {privacyText}
    </Typography.Link>
  ) : null

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap
      gap="large"
      style={{
        paddingBlock: '1rem',
        paddingInline: 'clamp(1rem, 4vw, 2.5rem)',
        borderBlockStart: '1px solid var(--ant-color-split)',
      }}
    >
      <Typography.Text type="secondary" style={LINK_STYLE}>
        {I18n.t('shared.copyright', { year, display_name: displayName() })}
      </Typography.Text>
      <Flex align="center" wrap gap="large">
        <Typography.Link
          href={`/privacy-statement?lang=${I18n.currentLocale()}`}
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          {I18n.t('shared.privacy_notice')}
        </Typography.Link>
        <Typography.Link
          href={`/cookies-statement?lang=${I18n.currentLocale()}`}
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          {I18n.t('shared.cookie_notice')}
        </Typography.Link>
        {projectPrivacyLink}
        {manageCookies.available ? (
          <Typography.Link onClick={manageCookies.openDrawer} style={LINK_STYLE}>
            {I18n.t('shared.manage_cookies')}
          </Typography.Link>
        ) : null}
      </Flex>
    </Flex>
  )
}

export const PageFooter = connector(PageFooterComponent)

export default PageFooter
