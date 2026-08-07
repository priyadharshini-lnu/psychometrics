import React, { useState } from 'react'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { PublicKey, PublicKeyTR } from '~/modules/admin/modules/client/core/publicKeys'
import { PublicKeysTable } from './PublicKeysTable'
import { PublicKeyAddModal } from './PublicKeyAddModal'
import { PublicKeyGenerateModal } from './PublicKeyGenerateModal'
import { PublicKeysFilter } from './PublicKeysFilter'

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
