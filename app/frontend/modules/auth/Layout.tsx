/* eslint-disable react/no-danger */
import { CSSProperties } from 'react'
import { Route } from 'react-router-dom'
import {
  Layout, Row, Col, Space, ConfigProvider,
} from 'antd'
import { connect } from 'react-redux'
import cs from 'classnames'
import LangDropdown from '~/components/LangDropdown'
import { isRtl } from '~/utils/locales'
import routes from './routes'
import styles from './styles.less'
import logo from './media/TTE_Logo_Color_Light_Bg.png'
import footerLogo from './media/TTE_Logo_Color_Monogram.png'
import { RootState } from './core/reducers'

const { I18n } = window

export const LayoutComponent = ({ config }) => {
  ConfigProvider.config({
    theme: {
      primaryColor: config.primary_color,
      errorColor: config.error_color,
      warningColor: config.warning_color,
      successColor: config.success_color,
      infoColor: config.info_color,
    },
  })

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
  }

  return (
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
  )
}

export const AuthLayout = connect(({ projectConfig }: RootState) => ({ config: projectConfig }), {})(LayoutComponent)
