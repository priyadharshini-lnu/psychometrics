import React from 'react'
import { Switch } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { PublicKey } from '~/modules/admin/modules/client/core/publicKeys'

const { I18n } = window

export const PublicKeysTable: React.FC = () => (
  <Resource.Table pagination>
    <Resource.Column<PublicKey>
      title={I18n.t('shared.id')}
      id="id"
      dataIndex="id"
      sorter
    />
    <Resource.Column<PublicKey>
      title={I18n.t('admin.key_id')}
      id="key_id"
      dataIndex="keyId"
    />
    <Resource.Column<PublicKey>
      title={I18n.t('shared.status')}
      id="disabled"
      dataIndex="disabled"
      render={(disabled: boolean, record: PublicKey) => (
        <ActiveSwitch publicKey={record} />
      )}
    />
    <Resource.Column<PublicKey>
      title={I18n.t('shared.description')}
      id="description"
      dataIndex="description"
    />
    <Resource.Column<PublicKey>
      title={I18n.t('admin.fingerprint')}
      id="fingerprint"
      dataIndex="fingerprint"
      render={(fingerprint: string | null) => (
        fingerprint ? <code>{fingerprint}</code> : '—'
      )}
    />
    <Resource.Column<PublicKey>
      title={I18n.t('shared.created_at')}
      id="created_at"
      dataIndex="createdAt"
      sorter
    />
    <Resource.Column<PublicKey>
      title={I18n.t('shared.created_by')}
      id="created_by"
      dataIndex="createdBy"
    />
  </Resource.Table>
)

const ActiveSwitch: React.FC<{ publicKey: PublicKey }> = ({ publicKey }) => {
  const { resource } = useResourceContext<PublicKey>()
  return (
    <Switch
      checked={!publicKey.disabled}
      loading={resource.isLoading(`update@${publicKey.id}`)}
      onChange={checked => resource.updateResource({ id: publicKey.id, disabled: !checked })}
    />
  )
}
