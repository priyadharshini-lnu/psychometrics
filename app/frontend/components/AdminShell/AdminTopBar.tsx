import { FC } from 'react'
import { Provider } from 'react-redux'
import { Flex, useGlintToken } from '@thetalententerprise/glint'
import { useMedia } from 'use-media'
import Notifications from '~/modules/admin/modules/AdminJob/Notifications'
import adminJobStore from '~/modules/admin/modules/AdminJob/store'
import { ClientSwitcher } from '~/components/ClientSwitcher'
import { AdminLanguageSwitcher } from './AdminLanguageSwitcher'
import { ProfileMenu } from './ProfileMenu'

// Notifications keeps its own store; no Router/ApiProvider here, the SPA supplies both.
export const AdminTopBarEnd: FC = () => {
  const token = useGlintToken()
  const isMobile = useMedia({ maxWidth: 600 })
  const { features, adminLocales } = window.PsyGlobalState

  return (
    <Provider store={adminJobStore}>
      <Flex flex={1} justify="flex-end" align="center" gap={token.marginXS}>
        {features.enable_intl_for_admins && !isMobile
          ? <AdminLanguageSwitcher locales={adminLocales.split(',')} />
          : null}
        <Notifications isMobile={isMobile} />
        <ProfileMenu isMobile={isMobile} />
      </Flex>
    </Provider>
  )
}

export const AdminTopBarStart: FC = () => {
  const { clientContextData, switchableClients, recentClientIds } = window.PsyGlobalState || {}
  if (!clientContextData) return null

  return (
    <ClientSwitcher
      currentClient={clientContextData}
      switchableClients={switchableClients || []}
      recentClientIds={recentClientIds || []}
    />
  )
}
