import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { APIKey, APIKeyTR } from '~/modules/admin/modules/client/core/apiKeys'
import { Resource } from '~/modules/admin/components/Resource'
import { APIKeysBreadcrumb } from './APIKeysBreadcrumb'
import { APIKeysFormModal } from './APIKeysFormModal'
import { APIKeysTable } from './APIKeysTable'
import { APIKeysFilter } from './APIKeysFilter'

const APIKeysList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey>()
  const { adminId } = useParams<{ adminId: string }>()
  const config = {
    trackUrl: true,
    responseType: APIKeyTR,
    basePath: `users/${adminId}`,
    apiConfig: {
      include_meta: ['user'],
    },
  }
  const openModal = (apiKey: APIKey) => {
    setSelectedApiKey(apiKey)
    setIsModalOpen(true)
  }
  return (
    <>
      <Resource config={config} name="api_keys">
        <APIKeysBreadcrumb />
        <APIKeysFilter openModal={() => setIsModalOpen(true)} />
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
    </>
  )
}

export default APIKeysList
