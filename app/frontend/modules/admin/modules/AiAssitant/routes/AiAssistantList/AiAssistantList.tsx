import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { AiAssistant, AiAssistantTR } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { Resource } from '~/modules/admin/components/Resource'
import { AiAssistantsBreadcrumb } from './AiAssistantsBreadcrumb'
import { AiAssistantFormModal } from './AiAssistantFormModal'
import { AiAssistantsTable } from './AiAssistantsTable'
import { AiAssistantsFilter } from './AiAssistantFilter'

const MODALS = {
  AiAssistantFormModal,
}

const connector = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

const AiAssistantList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const config = {
    basePath: '/ai',
    responseType: AiAssistantTR,
    apiConfig: {
      include: ['assistant_output_schema_keys'],
    },
  }

  const handleOpenModal = (aiAssistant?: AiAssistant) => {
    openModal('AiAssistantFormModal', { aiAssistant })
  }

  return (
    <>
      <Resource config={config} name="assistants">
        <AiAssistantsBreadcrumb />
        <AiAssistantsFilter openModal={openModal} />
        <AiAssistantsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />

      </Resource>
    </>
  )
}

export default connector(AiAssistantList)
