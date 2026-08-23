import React, { useState } from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { Application, ApplicationTR } from '~/modules/admin/modules/client/core/applications'
import { ApplicationsFilter } from './ApplicationsFilter'
import { ApplicationsTable } from './ApplicationsTable'
import { ApplicationFormModal } from './ApplicationFormModal'

const { I18n } = window

type Props = {
  query: Record<string, string>
}

export const ApplicationsList: React.FC<Props> = ({ query }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    responseType: ApplicationTR,
    apiConfig: { query },
  }

  return (
    <Resource<Application, BaseMeta>
      title={I18n.t('admin.applications')}
      config={config}
      name="applications"
      settingsKey={TABLE_SETTINGS_KEYS.settingsApplications}
    >
      <div>
        <ApplicationsFilter openAddModal={() => setIsModalOpen(true)} />
        <ApplicationsTable />
        {isModalOpen && <ApplicationFormModal close={() => setIsModalOpen(false)} />}
      </div>
    </Resource>
  )
}
