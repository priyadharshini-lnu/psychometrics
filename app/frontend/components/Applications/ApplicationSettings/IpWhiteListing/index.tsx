import React, { useEffect, useState } from 'react'
import { App } from 'antd'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { useResources } from '~/hooks/useResources'
import {
  ApplicationIpWhitelistSetting, ApplicationIpWhitelistSettingTR,
} from '~/modules/admin/modules/client/core/applicationIpWhitelistEntries'
import { IpSettings } from './IpSettings'
import { baseErrorMessage } from '~/hooks/useResources/utils'

const { I18n } = window

type Props = {
  applicationId: string
}

export const IpWhiteListing: React.FC<Props> = ({ applicationId }) => {
  const { message } = App.useApp()

  const {
    data: settings,
    fetch: fetchIpSettings,
    updateResource: updateIpSettings,
    isLoading: isIpSettingsLoading,
  } = useResources<ApplicationIpWhitelistSetting, BaseMeta>('application_settings', {
    basePath: `applications/${applicationId}`,
    trackUrl: false,
    responseType: ApplicationIpWhitelistSettingTR,
  })

  useEffect(() => {
    fetchIpSettings()
  }, [applicationId])

  const applicationIpWhitelistSetting = settings[0]

  const [localIpWhitelistingEnabled, setLocalIpWhitelistingEnabled] = useState<boolean | null>(null)
  // eslint-disable-next-line max-len
  const isIpWhitelistingEnabled = localIpWhitelistingEnabled ?? (applicationIpWhitelistSetting?.ipWhitelistingEnabled ?? false)

  const handleToggleWhitelisting = async (enabled: boolean) => {
    if (!applicationIpWhitelistSetting) {
      message.error(I18n.t('common.errors.something_wrong'))
      return
    }

    try {
      await updateIpSettings({
        id: applicationIpWhitelistSetting.id,
        ipWhitelistingEnabled: enabled,
      })

      await fetchIpSettings()
      setLocalIpWhitelistingEnabled(null)

      message.success(
        enabled
          ? I18n.t('admin.application_settings_ip_whitelisting_enabled_success')
          : I18n.t('admin.application_settings_ip_whitelisting_disabled_success'),
      )
    } catch (error) {
      if (error?.base) {
        message.error(baseErrorMessage(error))
      } else {
        message.error(I18n.t('common.errors.something_wrong'))
      }
    }
  }

  const handleRefreshApplicationSettings = async () => {
    const result = await fetchIpSettings()
    setLocalIpWhitelistingEnabled(null)
    return result
  }

  return (
    <IpSettings
      applicationId={applicationId}
      applicationIpWhitelistSetting={applicationIpWhitelistSetting}
      isIpWhitelistingEnabled={isIpWhitelistingEnabled}
      onToggleWhitelisting={handleToggleWhitelisting}
      onIpWhitelistingEnabledChange={setLocalIpWhitelistingEnabled}
      onRefreshApplicationSettings={handleRefreshApplicationSettings}
      isToggleLoading={
        applicationIpWhitelistSetting
          ? isIpSettingsLoading(`update@${applicationIpWhitelistSetting.id}`)
          : isIpSettingsLoading('add')
      }
    />
  )
}
