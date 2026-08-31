import React, { useState } from 'react'
import {
  Space, Switch, Typography,
} from 'antd'
import {
  ApplicationUrlWhitelistEntry, ApplicationUrlWhitelistEntryTR, ApplicationUrlWhitelistSetting,
} from '~/modules/admin/modules/client/core/applicationUrlWhitelistEntries'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { UrlWhiteListFilter } from './UrlWhiteListFilter'
import { UrlWhiteListFormModal } from './UrlWhiteListFormModal'
import { UrlWhiteListTable } from './UrlWhiteListTable'

const { I18n } = window
const { Text } = Typography

type Props = {
  applicationId: string
  applicationUrlWhitelistSetting?: ApplicationUrlWhitelistSetting
  isUrlWhitelistingEnabled: boolean
  isToggleLoading: boolean
  onToggleWhitelisting: (enabled: boolean) => void
  onUrlWhitelistingEnabledChange: (enabled: boolean) => void
  onRefreshApplicationSettings: () => Promise<unknown>
}

export const UrlSettings: React.FC<Props> = ({
  applicationId,
  applicationUrlWhitelistSetting,
  isUrlWhitelistingEnabled,
  isToggleLoading,
  onToggleWhitelisting,
  onUrlWhitelistingEnabledChange,
  onRefreshApplicationSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    responseType: ApplicationUrlWhitelistEntryTR,
    basePath: `applications/${applicationId}`,
  }

  return (
    <Resource<ApplicationUrlWhitelistEntry, BaseMeta>
      title={I18n.t('admin.url_whitelisting')}
      config={config}
      name="application_url_whitelist_entries"
      settingsKey={TABLE_SETTINGS_KEYS.settingsApplicationsUrlWhitelist}
    >
      <div>
        <Space orientation="vertical" size={12} style={{ width: '100%' }} className="mb8 pl">
          <Space>
            <Switch
              checked={isUrlWhitelistingEnabled}
              onChange={onToggleWhitelisting}
              disabled={!applicationUrlWhitelistSetting}
              loading={isToggleLoading}
            />
            <Text className="font-semi-bold">{I18n.t('admin.application_settings_enable_url_whitelisting')}</Text>
          </Space>
        </Space>
        <UrlWhiteListFilter openModal={() => setIsModalOpen(true)} />
        <UrlWhiteListTable
          onUrlWhitelistingEnabledChange={onUrlWhitelistingEnabledChange}
          onRefreshApplicationSettings={onRefreshApplicationSettings}
        />
        {isModalOpen && (
          <UrlWhiteListFormModal
            close={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </Resource>
  )
}
