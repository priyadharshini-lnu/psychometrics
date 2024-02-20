import React from 'react'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { APIKey, APIKeysMeta } from '~/modules/admin/modules/client/core/apiKeys'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

type meta = APIKeysMeta & BaseMeta
export const APIKeysBreadcrumb: React.FC = () => {
  const { resource } = useResourceContext<APIKey, meta>()

  return (
    !resource.isLoading('fetch') ? (
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('users.dashboard'),
          },
          {
            label: () => I18n.t('users.admins'),
            link: () => '/admin/users/admins',
          },
          {
            label: () => resource.meta.user?.email,
          },
        ]}
      />
    ) : null
  )
}
