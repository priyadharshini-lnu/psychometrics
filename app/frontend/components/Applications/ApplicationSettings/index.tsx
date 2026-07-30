import React from 'react'
import { Tabs } from 'antd'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { User } from '~/modules/admin/modules/client/core/users'
import { IpWhiteListing } from './IpWhiteListing'
import { UrlWhiteListing } from './UrlWhiteListing'

const { I18n } = window

type Props = {
  currentUser: User
  applicationId: string
  baseUrl: string
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)

const ApplicationSettingsComponent: React.FC<Props> = ({
  currentUser,
  applicationId,
  baseUrl,
}) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const getActiveTab = (): string => {
    const lastSegment = pathname.split('/').filter(Boolean).pop()

    if (lastSegment === 'ip_whitelisting') return 'ip_whitelisting'
    if (lastSegment === 'url_whitelisting') return 'url_whitelisting'
    return 'ip_whitelisting'
  }

  const handleTabChange = (key: string) => {
    navigate(`${baseUrl}/${key}`)
  }

  const tabItems = [
    ...(isSuperAdmin(currentUser)
      ? [
        {
          key: 'ip_whitelisting',
          label: I18n.t('admin.ip_whitelisting'),
          children: <IpWhiteListing applicationId={applicationId} />,
        },
        {
          key: 'url_whitelisting',
          label: I18n.t('admin.url_whitelisting'),
          children: <UrlWhiteListing applicationId={applicationId} />,
        },
      ]
      : []),
  ]

  return (
    <Tabs
      activeKey={getActiveTab()}
      items={tabItems}
      onChange={handleTabChange}
      tabBarStyle={{ padding: '0 20px' }}
    />
  )
}

export const ApplicationSettings = connecter(ApplicationSettingsComponent)
