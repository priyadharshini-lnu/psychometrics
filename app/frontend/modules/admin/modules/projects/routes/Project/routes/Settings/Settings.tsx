import React, { FC } from 'react'
import { Menu } from 'antd'
import RouteList from 'components/RouteList'
import settings from 'modules/admin/modules/projects/settings'
import routeUtils from 'utils/route'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { History } from 'history'
import { routes } from './routes'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type OwnProps = {
  history: History
}
type Props = PropsFromRedux & OwnProps

export const SettingsComponent: FC<Props> = ({ history, currentUser }) => {
  const prefix = `${settings.urlPrefix}/:projectId/settings`

  const modifiedRoutes = () => {
    let firstRoute = ''
    if (currentUser.permissions.manageProjectSmtpSettings) {
      firstRoute = '/smtp'
    } else if (currentUser.permissions.manageProjectSamlSetting) {
      firstRoute = '/saml'
    }
    return [{ redirect: true, from: '', to: firstRoute }, ...routes]
  }

  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, prefix, key)
  }

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        {currentUser.permissions.manageProjectSmtpSettings && (
          <Menu.Item key="/smtp">{I18n.t('administration.smtp_settings.smtp')}</Menu.Item>)
        }
        {currentUser.permissions.manageProjectSamlSetting && (
          <Menu.Item key="/saml">{I18n.t('administration.saml_settings.saml')}</Menu.Item>)
        }
      </Menu>
      <RouteList routes={modifiedRoutes()} urlPrefix={prefix} />
    </div>
  )
}

export const Settings = connecter(SettingsComponent)
