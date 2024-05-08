import { FC } from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { History } from 'history'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import RouteList from '~/components/RouteList'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import routeUtils from '~/utils/route'
import { RootState } from '~/modules/admin/core/rootReducers'
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
  const { permissions } = currentUser
  const modifiedRoutes = () => {
    let firstRoute = ''
    if (permissions.manageProjectGeneralSettings) {
      firstRoute = '/general'
    } else if (permissions.manageProjectSmtpSettings) {
      firstRoute = '/smtp'
    } else if (permissions.manageProjectSamlSetting) {
      firstRoute = '/saml'
    } else if (permissions.manageProjectIntegrations) {
      firstRoute = '/integrations'
    } else if (permissions.manageProjectSecuritySettings) {
      firstRoute = '/security'
    } else if (permissions.manageProjectWebhooks) {
      firstRoute = '/webhooks'
    } else if (permissions.manageProjectPrivacySetting) {
      firstRoute = '/privacy'
    }
    return [{ redirect: true, from: '', to: firstRoute }, ...routes]
  }

  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, prefix, key)
  }
  const menuItems:ItemType[] = []

  permissions.manageProjectGeneralSettings && menuItems.push({
    key: '/general',
    label: I18n.t('administration.project_tabs.general'),
  })
  permissions.manageProjectSmtpSettings && menuItems.push({
    key: '/smtp',
    label: I18n.t('administration.smtp_settings.smtp'),
  })
  permissions.manageProjectSamlSetting && menuItems.push({
    key: '/saml',
    label: I18n.t('administration.saml_settings.saml'),
  })
  permissions.manageProjectIntegrations && menuItems.push({
    key: '/integrations',
    label: I18n.t('administration.integrations.integrations'),
  })
  permissions.manageProjectSecuritySettings && menuItems.push({
    key: '/security',
    label: I18n.t('administration.security_setting.security'),
  })
  permissions.manageDesignSettings && menuItems.push({
    key: '/design',
    label: I18n.t('administration.project_tabs.design'),
  })
  permissions.manageProfileSettings && menuItems.push({
    key: '/profile',
    label: I18n.t('administration.project_tabs.profile'),
  })
  permissions.manageProjectWebhooks && menuItems.push({
    key: '/webhooks',
    label: I18n.t('administration.project_tabs.webhooks.title'),
  })
  permissions.manageProjectPrivacySetting && menuItems.push({
    key: '/privacy',
    label: I18n.t('administration.project_tabs.privacy'),
  })

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      />
      <RouteList routes={modifiedRoutes()} urlPrefix={prefix} />
    </div>
  )
}

export const Settings = connecter(SettingsComponent)
