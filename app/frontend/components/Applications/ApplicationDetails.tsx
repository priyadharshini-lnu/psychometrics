import React, { useEffect, useState } from 'react'
import { Tabs, Spin } from 'antd'
import { connect } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import {
  Application,
  ApplicationTR,
} from '~/modules/admin/modules/client/core/applications'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { User } from '~/modules/admin/modules/client/core/users'
import { setApplication } from '~/modules/admin/core/ui/breadcrumbs'
import {
  ApplicationOverview,
  ApplicationAPIKeys,
  ApplicationPublicKeys,
  ApplicationSettings,
} from '~/components/Applications'
import { ApplicationPermissions } from './ApplicationPermissions'
import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

const { I18n } = window
const { application_public_keys_settings_enabled } = window.PsyGlobalState.features

type PermissionsConfig = {
  role: AdminTypes
  scopeFilter: Record<string, string>
}

type Props = {
  currentUser: User
  applicationId: string
  baseUrl: string
  permissionsConfig: PermissionsConfig
  setApplication: (application: { id?: number; name?: string }) => void
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  { setApplication },
)

const ApplicationDetailsComponent: React.FC<Props> = ({
  currentUser,
  applicationId,
  baseUrl,
  permissionsConfig,
  setApplication,
}) => {
  const { pathname } = useLocation()
  const { projectId, clientId } = useParams() as { projectId?: string, clientId?: string }
  const navigate = useNavigate()

  const {
    fetchSingle,
    getResource,
    memberAction,
    isLoading,
  } = useResources<Application, BaseMeta>('applications', {
    responseType: ApplicationTR,
  })

  const application = getResource(applicationId)

  useEffect(() => {
    if (applicationId) {
      fetchSingle({ id: applicationId })
    }
  }, [applicationId])

  useEffect(() => {
    if (application) {
      setApplication({ id: parseInt(application.id, 10), name: application.name })
    }
    return () => { setApplication({}) }
  }, [application?.name])

  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const SETTINGS_SUB_TABS = ['ip_whitelisting', 'url_whitelisting']

  const handleToggleDisabled = async (checked: boolean) => {
    setIsTogglingStatus(true)
    try {
      await memberAction({
        id: applicationId,
        action: checked ? 'activate' : 'deactivate',
        method: 'post',
        updateStore: true,
        responseType: ApplicationTR,
      })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const getActiveTab = (): string => {
    const lastSegment = pathname.split('/').filter(Boolean).pop() || ''

    if (lastSegment === 'api_keys') return 'api_keys'
    if (lastSegment === 'public_keys' && application_public_keys_settings_enabled) return 'public_keys'
    if (lastSegment === 'permissions') return 'permissions'
    if (SETTINGS_SUB_TABS.includes(lastSegment) && application_public_keys_settings_enabled) return 'settings'
    return 'overview'
  }

  const handleTabChange = (key: string) => {
    if (key === 'overview') {
      navigate(baseUrl)
    } else if (key === 'settings') {
      navigate(`${baseUrl}/settings/ip_whitelisting`)
    } else {
      navigate(`${baseUrl}/${key}`)
    }
  }

  const tabItems = [
    ...(isSuperAdmin(currentUser)
      ? [
        {
          key: 'overview',
          label: I18n.t('shared.overview'),
          children: application ? (
            <ApplicationOverview
              application={application}
              isTogglingStatus={isTogglingStatus}
              onToggleDisabled={handleToggleDisabled}
            />
          ) : null,
        },
        {
          key: 'api_keys',
          label: I18n.t('admin.api_keys'),
          children: <ApplicationAPIKeys applicationId={applicationId} />,
        },
        ...(application_public_keys_settings_enabled ? [
          {
            key: 'public_keys',
            label: I18n.t('admin.public_keys'),
            children: (
              <ApplicationPublicKeys
                applicationId={applicationId}
                projectId={projectId}
                clientId={clientId}
              />
            ),
          },
        ] : []),
        {
          key: 'permissions',
          label: I18n.t('shared.permissions'),
          children: (
            <ApplicationPermissions
              applicationId={applicationId}
              role={permissionsConfig.role}
              scopeFilter={permissionsConfig.scopeFilter}
            />
          ),
        },
        ...(application_public_keys_settings_enabled ? [
          {
            key: 'settings',
            label: I18n.t('admin.settings'),
            children: <ApplicationSettings applicationId={applicationId} baseUrl={`${baseUrl}/settings`} />,
          },
        ] : []),
      ]
      : []),
  ]

  return (
    <Spin spinning={isLoading(`fetch@${applicationId}`) && !application}>
      <Tabs
        activeKey={getActiveTab()}
        items={tabItems}
        onChange={handleTabChange}
        tabBarStyle={{ padding: '0 20px' }}
      />
    </Spin>
  )
}

export const ApplicationDetails = connecter(ApplicationDetailsComponent)
