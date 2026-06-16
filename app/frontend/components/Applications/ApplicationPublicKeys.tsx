import React, { useState } from 'react'
import { Button, Switch } from 'antd'
import { PlusOutlined, ThunderboltOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { PublicKey, PublicKeyTR } from '~/modules/admin/modules/client/core/publicKeys'
import { PublicKeyAddModal } from './PublicKeyAddModal'
import { PublicKeyGenerateModal } from './PublicKeyGenerateModal'

const { I18n } = window

type Props = {
  applicationId: string
}

export const ApplicationPublicKeys: React.FC<Props> = ({ applicationId }) => {
  const config = {
    responseType: PublicKeyTR,
    basePath: `applications/${applicationId}`,
  }

  return (
    <Resource<PublicKey, BaseMeta> config={config} name="public_keys">
      <PublicKeysContent applicationId={applicationId} />
    </Resource>
  )
}

type ContentProps = {
  applicationId: string
}

const PublicKeysContent: React.FC<ContentProps> = ({ applicationId }) => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const { resource } = useResourceContext<PublicKey>()

  const handleGenerateClose = () => {
    setGenerateModalOpen(false)
    resource.fetch()
  }

  return (
    <>
      <PublicKeysFilter
        onAddClick={() => setAddModalOpen(true)}
        onGenerateClick={() => setGenerateModalOpen(true)}
      />
      <PublicKeysTable />
      {addModalOpen && (
        <PublicKeyAddModal close={() => setAddModalOpen(false)} />
      )}
      {generateModalOpen && (
        <PublicKeyGenerateModal
          applicationId={applicationId}
          close={handleGenerateClose}
        />
      )}
    </>
  )
}

type FilterProps = {
  onAddClick: () => void
  onGenerateClick: () => void
}

const PublicKeysFilter: React.FC<FilterProps> = ({ onAddClick, onGenerateClick }) => {
  const { resource } = useResourceContext<PublicKey>()

  return (
    <Resource.Filter hideSearch name="filterable_fields">
      <Button
        onClick={onGenerateClick}
        disabled={resource.isLoading('fetch')}
        icon={<ThunderboltOutlined />}
      >
        {I18n.t('admin.public_key_generate')}
      </Button>
      <Button
        type="primary"
        onClick={onAddClick}
        disabled={resource.isLoading('fetch')}
        icon={<PlusOutlined />}
      >
        {I18n.t('admin.public_key_add')}
      </Button>
    </Resource.Filter>
  )
}

const PublicKeysTable: React.FC = () => (
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
