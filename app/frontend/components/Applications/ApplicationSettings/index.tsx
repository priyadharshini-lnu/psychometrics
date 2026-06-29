import React, { useEffect, useState } from 'react'
import { App } from 'antd'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { useResources } from '~/hooks/useResources'
import { ApplicationSetting, ApplicationSettingTR } from '~/modules/admin/modules/client/core/applicationSettings'
import { IpSettings } from './IpSettings'

const { I18n } = window

type Props = {
  applicationId: string
}

export const ApplicationSettings: React.FC<Props> = ({ applicationId }) => {
  const { message } = App.useApp()

  const {
    data: settings,
    fetch: fetchSettings,
    updateResource: updateSettings,
    isLoading: isSettingsLoading,
  } = useResources<ApplicationSetting, BaseMeta>('application_settings', {
    basePath: `applications/${applicationId}`,
    trackUrl: false,
    responseType: ApplicationSettingTR,
  })

  useEffect(() => {
    fetchSettings()
  }, [applicationId])

  const applicationSetting = settings[0]

  const [localIpWhitelistingEnabled, setLocalIpWhitelistingEnabled] = useState<boolean | null>(null)
  const isIpWhitelistingEnabled = localIpWhitelistingEnabled ?? (applicationSetting?.ipWhitelistingEnabled ?? false)

  const handleToggleWhitelisting = async (enabled: boolean) => {
    if (!applicationSetting) {
      message.error(I18n.t('common.errors.something_wrong'))
      return
    }

    try {
      await updateSettings({
        id: applicationSetting.id,
        ipWhitelistingEnabled: enabled,
      })

      await fetchSettings()
      setLocalIpWhitelistingEnabled(null)

      message.success(
        enabled
          ? I18n.t('admin.application_settings_ip_whitelisting_enabled_success')
          : I18n.t('admin.application_settings_ip_whitelisting_disabled_success'),
      )
    } catch (error) {
      if (error?.base) {
        message.error(error.base[0]?.title)
      } else {
        message.error(I18n.t('common.errors.something_wrong'))
      }
    }
  }

  const handleRefreshApplicationSettings = async () => {
    const result = await fetchSettings()
    setLocalIpWhitelistingEnabled(null)
    return result
  }

  return (
    <IpSettings
      applicationId={applicationId}
      applicationSetting={applicationSetting}
      isIpWhitelistingEnabled={isIpWhitelistingEnabled}
      onToggleWhitelisting={handleToggleWhitelisting}
      onIpWhitelistingEnabledChange={setLocalIpWhitelistingEnabled}
      onRefreshApplicationSettings={handleRefreshApplicationSettings}
      isToggleLoading={
        applicationSetting
          ? isSettingsLoading(`update@${applicationSetting.id}`)
          : isSettingsLoading('add')
      }
    />
  )
}
