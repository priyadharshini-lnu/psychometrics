import { FC } from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
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
type Props = PropsFromRedux

export const SettingsComponent: FC<Props> = ({ currentUser }) => {
  const navigate = useNavigate()
  const { projectId } = useParams() as { projectId: string }
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
    return [{ redirect: true, from: '', to: `${settings.urlPrefix}/${projectId}/settings${firstRoute}` }, ...routes]
  }

  const onSelect = ({ key }) => {
    routeUtils.moveTo(navigate, prefix, key)
  }
  const menuItems:MenuItem[] = []

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
    label: I18n.t('admin.sso_settings_tab'),
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
  permissions.manageProfileSettings && menuItems.push({
    key: '/registration',
    label: I18n.t('administration.project_tabs.registration'),
  })
  permissions.manageProjectWebhooks && menuItems.push({
    key: '/webhooks',
    label: I18n.t('administration.project_tabs.webhooks.title'),
  })
  permissions.manageProjectPrivacySetting && menuItems.push({
    key: '/privacy',
    label: I18n.t('administration.project_tabs.privacy'),
  })
  permissions.manageProjectAssessments && menuItems.push({
    key: '/assessments',
    label: I18n.t('administration.project_tabs.assessments.title'),
  })
  permissions.manageProjectFeatureFlags && menuItems.push({
    key: '/features',
    label: I18n.t('administration.settings.tabs.feature_flags'),
  })

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      />
      <RouteList routes={modifiedRoutes()} urlPrefix="" />
    </div>
  )
}

export const Settings = connecter(SettingsComponent)
