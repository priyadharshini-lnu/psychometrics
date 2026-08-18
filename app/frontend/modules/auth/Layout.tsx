/* eslint-disable react/no-danger */
import { CSSProperties } from 'react'
import { Route, Routes } from 'react-router-dom'
import {
  Layout, Row, Col, Space, theme, Flex,
} from 'antd'
import { connect } from 'react-redux'
import cs from 'classnames'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import { isRtl } from '~/utils/locales'
import routes from './routes'
import styles from './styles.less'
import logo from './media/TTE_Logo_Color_Light_Bg.png'
import footerLogo from './media/TTE_Logo_Color_Monogram.png'
import { RootState } from './core/reducers'
import { DefaultAntThemeWrapper } from '~/glint'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'
import { ManageCookiesButton } from '~/components/ManageCookiesButton'


const { I18n } = window
const { useToken } = theme
const { DEFAULT_PRIMARY_COLOR, GREY_BORDER } = constants

const ClientPrivacyLink = ({ config }) => {
  const projectPrivacyLinkText = config.privacy_link_text ?? ''
  const projectPrivacyLinkUrl = config.privacy_link_url ?? ''

  return (
    <Flex
      align="center"
      gap={8}
      style={{
        textAlign: 'center',
      }}
    >
      <a
        style={{
          color: 'var(--ant-primary-color)',
          cursor: 'pointer',
        }}
        href={projectPrivacyLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {projectPrivacyLinkText}
      </a>
    </Flex>
  )
}

export const LayoutComponent = ({ config }) => {
  const { token } = useToken()
  const primaryColor = config.primary_color || DEFAULT_PRIMARY_COLOR

  const isNeedReverse = () => {
    if (isRtl(I18n.currentLocale())) {
      if (config.login_box_position === 'left') {
        return true
      }
    } else if (config.login_box_position === 'right') {
      return true
    }
    return false
  }

  const bgStyles: CSSProperties = {
    backgroundColor: config.background_color,
  }
  if (config.background) {
    bgStyles.backgroundImage = `url(${config.background})`
    bgStyles.backgroundSize = config.background_size || 'cover'
  }

  const overlayStyles: CSSProperties = {}
  if (config.background_overlay) {
    overlayStyles.backgroundImage = `url(${config.background_overlay})`
  }

  return (
    <DefaultAntThemeWrapper
      theme={{
        token: {
          colorPrimary: primaryColor,
          colorError: config.error_color || token.colorError,
          colorWarning: config.warning_color || token.colorWarning,
          colorSuccess: config.success_color || token.colorSuccess,
          colorInfo: config.info_color || token.colorInfo,
          colorLink: primaryColor,
          colorBorder: GREY_BORDER,
          borderRadius: 2,
        },
      }}
    >
      <Row className={cs(styles.height, { [styles.reverse]: isNeedReverse() })}>
        <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 8 }}>
          <Layout className={styles.main}>
            <Layout.Header className={styles.header}>
              <div className={styles.logoWrapper}>
                <img alt={config.logo_alt_text} src={config.client_logo || logo} className={styles.logo} />
              </div>
              {config.id && <LangDropdownWithChangeLocale />}
            </Layout.Header>
            <Layout.Content className={styles.content}>
              <Routes>
                {routes.map((route, i) => (
                  <Route
                    key={i}
                    path={route.path}
                    element={<route.main />}
                  />
                ))}
              </Routes>
            </Layout.Content>
            <Layout.Footer className={styles.footer}>
              <Space>
                <img src={footerLogo} className={styles.footerLogo} alt={I18n.t('auth.lighthouse_logo_alt_text')} />
                <div
                  style={{
                    textAlign: 'center',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: I18n.t('auth.privacy_notice_link',
                      { privacy_url: `/privacy-statement?lang=${I18n.currentLocale()}` }),
                  }}
                />
                {config.enable_privacy_link && (
                  <ClientPrivacyLink config={config} />
                )}
                <div
                  style={{
                    whiteSpace: 'break-spaces',
                    lineHeight: '22px',
                    verticalAlign: 'text-top',
                    textAlign: 'center',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: I18n.t('auth.cookie_notice_link',
                      { cookies_url: `/cookies-statement?lang=${I18n.currentLocale()}` }),
                  }}
                />
                <ManageCookiesButton />
              </Space>
              {config.secondary_logo && <img src={config.secondary_logo} className={styles.footerLogo} />}
            </Layout.Footer>
          </Layout>
        </Col>
        <Col
          xs={{ span: 0 }}
          sm={{ span: 0 }}
          md={{ span: 0 }}
          lg={{ span: 16 }}
          style={bgStyles}
          className={styles.background}
        >
          <div className={styles.overlay} style={overlayStyles} />
        </Col>
      </Row>
    </DefaultAntThemeWrapper>
  )
}

export const AuthLayout = connect(({ projectConfig }: RootState) => ({ config: projectConfig }), {})(LayoutComponent)
