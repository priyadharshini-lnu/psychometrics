/* eslint-disable react/no-danger */
import { MouseEvent } from 'react'
import { theme } from 'antd'
import { Flex, Typography } from '@thetalententerprise/glint'
import { useManageCookies } from '~/hooks/useManageCookies'
import { LangControl } from '~/components/LangControl'
import { RootState } from '../core/reducers'
import { displayName, wordmarkCurrentColor, wordmarkHeightPx } from '~/utils/branding'

const { I18n } = window

type Config = RootState['projectConfig']

const SMALL_PRINT = { fontSize: 12.5 }

const ManageCookiesLink = () => {
  const { available, openDrawer } = useManageCookies()

  if (!available) return null

  const onClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    openDrawer()
  }

  return (
    <Typography.Text type="secondary" style={SMALL_PRINT}>
      <a href="#" onClick={onClick} role="button">
        {I18n.t('shared.manage_cookies')}
      </a>
    </Typography.Text>
  )
}

const LighthouseBrand = () => {
  const { token } = theme.useToken()
  const Wordmark = wordmarkCurrentColor()

  return (
    <Flex
      align="center"
      gap="small"
      role="img"
      aria-label={I18n.t('auth.lighthouse_logo_alt_text')}
      style={{ color: token.colorTextHeading }}
    >
      <Wordmark aria-hidden style={{ blockSize: `${wordmarkHeightPx()}px`, inlineSize: 'auto' }} />
    </Flex>
  )
}

type ProjectPrivacyLinkProps = {
  config: Config
}

const ClientPrivacyLink = ({ config }: ProjectPrivacyLinkProps) => {
  const projectPrivacyLinkText = config.privacy_link_text ?? ''
  const projectPrivacyLinkUrl = config.privacy_link_url ?? ''

  return (
    <Flex align="center" gap="large">
      <Typography.Text type="secondary" style={SMALL_PRINT}>
        <span>
          <a
            href={projectPrivacyLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {projectPrivacyLinkText}
          </a>
        </span>
      </Typography.Text>
    </Flex>
  )
}

export const buildAuthChrome = (config: Config) => {
  const brand = (
    <>
      {config.client_logo ? (
        <img
          height={30}
          src={config.client_logo}
          alt={config.logo_alt_text || I18n.t('auth.lighthouse_logo_alt_text')}
        />
      ) : (
        <LighthouseBrand />
      )}
      {config.id ? <LangControl /> : null}
    </>
  )

  const feature = config.background ? <img src={config.background} alt="" /> : null

  const footer = (
    <Flex vertical gap="large">
      <Flex align="center" justify="space-between" gap="large">
        <Typography.Text type="secondary" style={SMALL_PRINT}>
          {I18n.t('shared.copyright', { year: new Date().getFullYear(), display_name: displayName() })}
        </Typography.Text>
        {config.secondary_logo ? (
          <img height={32} src={config.secondary_logo} alt="" />
        ) : null}
      </Flex>
      <Flex component="nav" wrap align="center" gap="medium">
        <Typography.Text type="secondary" style={SMALL_PRINT}>
          <span
            dangerouslySetInnerHTML={{
              __html: I18n.t('auth.privacy_notice_link', {
                privacy_url: `/privacy-statement?lang=${I18n.currentLocale()}`,
              }),
            }}
          />
        </Typography.Text>
        {config.enable_privacy_link && (
          <ClientPrivacyLink config={config} />
        )}
        <Typography.Text type="secondary" style={SMALL_PRINT}>
          <span
            dangerouslySetInnerHTML={{
              __html: I18n.t('auth.cookie_notice_link', {
                cookies_url: `/cookies-statement?lang=${I18n.currentLocale()}`,
              }),
            }}
          />
        </Typography.Text>
        <ManageCookiesLink />
      </Flex>
    </Flex>
  )

  return { brand, feature, footer }
}
