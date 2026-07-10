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
import {
  ApplicationOverview,
  ApplicationAPIKeys,
  ApplicationPublicKeys,
  ApplicationSettings,
} from '~/components/Applications'
import { ApplicationPermissions } from './ApplicationPermissions'
import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

const { I18n } = window

type PermissionsConfig = {
  role: AdminTypes
  scopeFilter: Record<string, string>
}

type Props = {
  currentUser: User
  applicationId: string
  baseUrl: string
  permissionsConfig: PermissionsConfig
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)

const ApplicationDetailsComponent: React.FC<Props> = ({
  currentUser,
  applicationId,
  baseUrl,
  permissionsConfig,
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

  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

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
    const lastSegment = pathname.split('/').filter(Boolean).pop()

    if (lastSegment === 'api_keys') return 'api_keys'
    if (lastSegment === 'public_keys') return 'public_keys'
    if (lastSegment === 'permissions') return 'permissions'
    if (lastSegment === 'settings') return 'settings'
    return 'overview'
  }

  const handleTabChange = (key: string) => {
    if (key === 'overview') {
      navigate(baseUrl)
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
        {
          key: 'settings',
          label: I18n.t('admin.settings'),
          children: <ApplicationSettings applicationId={applicationId} />,
        },
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
