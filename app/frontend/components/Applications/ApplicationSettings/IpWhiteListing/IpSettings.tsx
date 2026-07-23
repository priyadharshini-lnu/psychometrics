import React, { useState } from 'react'
import {
  Space, Switch, Typography,
} from 'antd'
import {
  ApplicationIpWhitelistEntry, ApplicationIpWhitelistEntryTR, ApplicationIpWhitelistSetting,
} from '~/modules/admin/modules/client/core/applicationIpWhitelistEntries'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Resource } from '~/modules/admin/components/Resource'
import { IpWhiteListFilter } from './IpWhiteListFilter'
import { IpWhiteListFormModal } from './IpWhiteListFormModal'
import { IpWhiteListTable } from './IpWhiteListTable'

const { I18n } = window
const { Text } = Typography

type Props = {
  applicationId: string
  applicationIpWhitelistSetting?: ApplicationIpWhitelistSetting
  isIpWhitelistingEnabled: boolean
  isToggleLoading: boolean
  onToggleWhitelisting: (enabled: boolean) => void
  onIpWhitelistingEnabledChange: (enabled: boolean) => void
  onRefreshApplicationSettings: () => Promise<unknown>
}

export const IpSettings: React.FC<Props> = ({
  applicationId,
  applicationIpWhitelistSetting,
  isIpWhitelistingEnabled,
  isToggleLoading,
  onToggleWhitelisting,
  onIpWhitelistingEnabledChange,
  onRefreshApplicationSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    responseType: ApplicationIpWhitelistEntryTR,
    basePath: `applications/${applicationId}`,
  }

  return (
    <Resource<ApplicationIpWhitelistEntry, BaseMeta> config={config} name="application_ip_whitelist_entries">
      <div className="pl">
        <Space orientation="vertical" size={12} style={{ width: '100%' }} className="mb8">
          <div>
            <p>
              <Text strong className="mb4">
                {I18n.t('admin.application_settings_ip_addresses')}
              </Text>
            </p>
          </div>

          <Space>
            <Switch
              checked={isIpWhitelistingEnabled}
              onChange={onToggleWhitelisting}
              disabled={!applicationIpWhitelistSetting}
              loading={isToggleLoading}
            />
            <Text className="font-semi-bold">{I18n.t('admin.application_settings_enable_ip_whitelisting')}</Text>
          </Space>
        </Space>
        <IpWhiteListFilter openModal={() => setIsModalOpen(true)} />
        <IpWhiteListTable
          onIpWhitelistingEnabledChange={onIpWhitelistingEnabledChange}
          onRefreshApplicationSettings={onRefreshApplicationSettings}
        />
        {isModalOpen && (
          <IpWhiteListFormModal
            close={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </Resource>
  )
}
