/* eslint-disable react/no-danger */
import { CSSProperties } from 'react'
import { Route } from 'react-router-dom'
import {
  Layout, Row, Col, Space, theme,
} from 'antd'
import { connect } from 'react-redux'
import cs from 'classnames'
import LangDropdown from '~/components/LangDropdown'
import { isRtl } from '~/utils/locales'
import routes from './routes'
import styles from './styles.less'
import logo from '~/assets/lighthouseLogoTall.png'
import footerLogo from '~/assets/TTE_Logo_Color_Monogram.png'
import { RootState } from './core/reducers'
import { DefaultAntThemeWrapper } from '~/glint'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'

const { I18n } = window
const { useToken } = theme
const { DEFAULT_PRIMARY_COLOR } = constants

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
        },
      }}
    >
      <Row className={cs(styles.height, { [styles.reverse]: isNeedReverse() })}>
        <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 8 }}>
          <Layout className={styles.main}>
            <Layout.Header className={styles.header}>
              <div className={styles.logoWrapper}>
                <img src={config.client_logo || logo} className={styles.logo} />
              </div>
              {config.id && <LangDropdown />}
            </Layout.Header>
            <Layout.Content className={styles.content}>
              {routes.map((route, i) => (
                <Route
                  key={i}
                  path={route.path}
                  exact={route.exact}
                  component={route.main}
                />
              ))}
            </Layout.Content>
            <Layout.Footer className={styles.footer}>
              <Space>
                <img src={footerLogo} className={styles.footerLogo} />
                <div dangerouslySetInnerHTML={{
                  __html: I18n.t('auth.terms_link',
                    { terms_url: 'https://thetalententerprise.com/privacy-statement/' }),
                }}
                />
              </Space>
              {config.secondary_logo && <img src={config.secondary_logo} className={styles.footerLogo} />}
            </Layout.Footer>
          </Layout>
        </Col>
        <Col
          xs={{ span: 0 }}
          sm={{ span: 0 }}
          lg={{ span: 16 }}
          style={bgStyles}
          className={styles.background}
        />
      </Row>
    </DefaultAntThemeWrapper>
  )
}

export const AuthLayout = connect(({ projectConfig }: RootState) => ({ config: projectConfig }), {})(LayoutComponent)
