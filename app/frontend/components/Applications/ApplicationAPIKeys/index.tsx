import React, { useState } from 'react'
import { APIKey, APIKeyTR } from '~/modules/admin/modules/client/core/apiKeys'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Resource } from '~/modules/admin/components/Resource'
import { APIKeysFilter } from './APIKeysFilter'
import { APIKeysTable } from './APIKeysTable'
import { APIKeysFormModal } from './APIKeysFormModal'

type Props = {
  applicationId: string
}

export const ApplicationAPIKeys: React.FC<Props> = ({ applicationId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey | undefined>()

  const config = {
    responseType: APIKeyTR,
    basePath: `users/${applicationId}`,
  }

  const openModal = (apiKey?: APIKey) => {
    setSelectedApiKey(apiKey)
    setIsModalOpen(true)
  }

  return (
    <Resource<APIKey, BaseMeta> config={config} name="api_keys">
      <APIKeysFilter openModal={() => openModal()} />
      <APIKeysTable openModal={openModal} />
      {isModalOpen && (
        <APIKeysFormModal
          apiKey={selectedApiKey}
          close={() => {
            setSelectedApiKey(undefined)
            setIsModalOpen(false)
          }}
        />
      )}
    </Resource>
  )
}
