import React, { useEffect, useState } from 'react'
import { App } from 'antd'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { useResources } from '~/hooks/useResources'
import {
  ApplicationUrlWhitelistSetting, ApplicationUrlWhitelistSettingTR,
} from '~/modules/admin/modules/client/core/applicationUrlWhitelistEntries'
import { UrlSettings } from './UrlSettings'
import { baseErrorMessage } from '~/hooks/useResources/utils'

const { I18n } = window

type Props = {
  applicationId: string
}

export const UrlWhiteListing: React.FC<Props> = ({ applicationId }) => {
  const { message } = App.useApp()

  const {
    data: settings,
    fetch: fetchUrlSettings,
    updateResource: updateUrlSettings,
    isLoading: isUrlSettingsLoading,
  } = useResources<ApplicationUrlWhitelistSetting, BaseMeta>('application_settings', {
    basePath: `applications/${applicationId}`,
    trackUrl: false,
    responseType: ApplicationUrlWhitelistSettingTR,
  })

  useEffect(() => {
    fetchUrlSettings()
  }, [applicationId])

  const applicationUrlWhitelistSetting = settings[0]

  const [localUrlWhitelistingEnabled, setLocalUrlWhitelistingEnabled] = useState<boolean | null>(null)
  // eslint-disable-next-line max-len
  const isUrlWhitelistingEnabled = localUrlWhitelistingEnabled ?? (applicationUrlWhitelistSetting?.urlWhitelistingEnabled ?? false)

  const handleToggleWhitelisting = async (enabled: boolean) => {
    if (!applicationUrlWhitelistSetting) {
      message.error(I18n.t('common.errors.something_wrong'))
      return
    }

    try {
      await updateUrlSettings({
        id: applicationUrlWhitelistSetting.id,
        urlWhitelistingEnabled: enabled,
      })

      await fetchUrlSettings()
      setLocalUrlWhitelistingEnabled(null)

      message.success(
        enabled
          ? I18n.t('admin.application_settings_url_whitelisting_enabled_success')
          : I18n.t('admin.application_settings_url_whitelisting_disabled_success'),
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
    const result = await fetchUrlSettings()
    setLocalUrlWhitelistingEnabled(null)
    return result
  }

  return (
    <UrlSettings
      applicationId={applicationId}
      applicationUrlWhitelistSetting={applicationUrlWhitelistSetting}
      isUrlWhitelistingEnabled={isUrlWhitelistingEnabled}
      onToggleWhitelisting={handleToggleWhitelisting}
      onUrlWhitelistingEnabledChange={setLocalUrlWhitelistingEnabled}
      onRefreshApplicationSettings={handleRefreshApplicationSettings}
      isToggleLoading={
        applicationUrlWhitelistSetting
          ? isUrlSettingsLoading(`update@${applicationUrlWhitelistSetting.id}`)
          : isUrlSettingsLoading('add')
      }
    />
  )
}
