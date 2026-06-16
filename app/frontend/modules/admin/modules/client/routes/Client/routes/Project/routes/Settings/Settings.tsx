import { FC } from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import RouteList from '~/components/RouteList'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import routeUtils from '~/utils/route'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isSuperAdmin } from '~/core/currentUser'
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
    label: I18n.t('admin.project_tabs_general'),
  })
  isSuperAdmin(currentUser) && menuItems.push({
    key: '/applications',
    label: I18n.t('admin.applications'),
  })
  permissions.manageProjectSmtpSettings && menuItems.push({
    key: '/smtp',
    label: I18n.t('admin.smtp_settings_smtp'),
  })
  permissions.manageProjectSamlSetting && menuItems.push({
    key: '/saml',
    label: I18n.t('admin.sso_settings_tab'),
  })
  permissions.manageProjectIntegrations && menuItems.push({
    key: '/integrations',
    label: I18n.t('admin.integrations_integrations'),
  })
  permissions.manageProjectSecuritySettings && menuItems.push({
    key: '/security',
    label: I18n.t('admin.security_setting_security'),
  })
  permissions.manageDesignSettings && menuItems.push({
    key: '/design',
    label: I18n.t('admin.project_tabs_design'),
  })
  permissions.manageProfileSettings && menuItems.push({
    key: '/profile',
    label: I18n.t('admin.project_tabs_profile'),
  })
  permissions.manageProfileSettings && menuItems.push({
    key: '/registration',
    label: I18n.t('admin.project_tabs_registration'),
  })
  permissions.manageProjectWebhooks && menuItems.push({
    key: '/webhooks',
    label: I18n.t('admin.project_tabs_webhooks_title'),
  })
  permissions.manageProjectPrivacySetting && menuItems.push({
    key: '/privacy',
    label: I18n.t('admin.project_tabs_privacy'),
  })
  permissions.manageProjectAssessments && menuItems.push({
    key: '/assessments',
    label: I18n.t('admin.project_tabs_assessments_title'),
  })
  permissions.manageProjectFeatureFlags && menuItems.push({
    key: '/features',
    label: I18n.t('admin.settings_tabs_feature_flags'),
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
