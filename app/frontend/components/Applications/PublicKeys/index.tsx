import React, { useState } from 'react'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { PublicKey, PublicKeyTR } from '~/modules/admin/modules/client/core/publicKeys'
import { PublicKeysTable } from './PublicKeysTable'
import { PublicKeyAddModal } from './PublicKeyAddModal'
import { PublicKeyGenerateModal } from './PublicKeyGenerateModal'
import { PublicKeysFilter } from './PublicKeysFilter'

const { I18n } = window

type Props = {
  applicationId: string
  projectId?: string
  clientId?: string
}

export const ApplicationPublicKeys: React.FC<Props> = ({ applicationId, projectId, clientId }) => {
  let query = {}
  if (projectId) {
    query = { project_id: projectId }
  } else if (clientId) {
    query = { client_id: clientId }
  }

  const config = {
    responseType: PublicKeyTR,
    basePath: `applications/${applicationId}`,
    apiConfig: {
      query,
    },
  }

  return (
    <Resource<PublicKey, BaseMeta>
      title={I18n.t('admin.public_keys')}
      config={config}
      name="public_keys"
      settingsKey={TABLE_SETTINGS_KEYS.settingsApplicationsPublicKeys}
    >
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
    <div>
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
    </div>
  )
}
