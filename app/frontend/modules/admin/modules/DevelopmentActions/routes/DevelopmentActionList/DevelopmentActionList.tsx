import React, { useState } from 'react'
import { DevelopmentActionTR, DevelopmentAction } from '~/modules/admin/modules/client/core/developmentAction'
import { Resource } from '~/modules/admin/components/Resource'
import { DevelopmentActionsBreadcrumb } from './DevelopmentActionsBreadcrumb'
import { DevelopmentActionsFormModal } from './DevelopmentActionsFormModal'
import { DevelopmentActionsTable } from './DevelopmentActionsTable'
import { DevelopmentActionsFilter } from './DevelopmentActionsFilter'

const DevelopmentActionList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDevelopmentAction, setSelectedDevelopmentAction] = useState<DevelopmentAction>()
  const config = {
    trackUrl: true,
    responseType: DevelopmentActionTR,
    apiConfig: {
      include: ['project', 'skills'],
    },
  }
  const openModal = (developmentAction: DevelopmentAction) => {
    setSelectedDevelopmentAction(developmentAction)
    setIsModalOpen(true)
  }
  return (
    <>
      <Resource config={config} name="development_actions">
        <DevelopmentActionsBreadcrumb />
        <DevelopmentActionsFilter openModal={() => setIsModalOpen(true)} />
        <DevelopmentActionsTable openModal={openModal} />
        {isModalOpen && (
          <DevelopmentActionsFormModal
            developmentAction={selectedDevelopmentAction}
            close={() => {
              setSelectedDevelopmentAction(undefined)
              setIsModalOpen(false)
            }}
          />
        )}
      </Resource>
    </>
  )
}

export default DevelopmentActionList
