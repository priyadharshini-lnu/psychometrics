import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { DevelopmentActionTR, DevelopmentAction } from '~/modules/admin/modules/client/core/developmentAction'
import { Resource } from '~/modules/admin/components/Resource'
import { DevelopmentActionsBreadcrumb } from './DevelopmentActionsBreadcrumb'
import { DevelopmentActionsFormModal } from './DevelopmentActionsFormModal'
import { DevelopmentActionsExportModal } from './DevelopmentActionsExportModal'
import { DevelopmentActionsTable } from './DevelopmentActionsTable'
import { DevelopmentActionsFilter } from './DevelopmentActionsFilter'
import { DevelopmentActionsImportModal } from './DevelopmentActionsImportModal'

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const MODALS = {
  DevelopmentActionsImportModal,
  DevelopmentActionsFormModal,
  DevelopmentActionsExportModal,
}

const DevelopmentActionList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const config = {
    trackUrl: true,
    responseType: DevelopmentActionTR,
    apiConfig: {
      include: ['project', 'skills'],
    },
  }
  const handleOpenModal = (developmentAction?: DevelopmentAction) => {
    openModal('DevelopmentActionsFormModal', { developmentAction })
  }

  return (
    <>
      <Resource config={config} name="development_actions">
        <DevelopmentActionsBreadcrumb />
        <DevelopmentActionsFilter openModal={openModal} />
        <DevelopmentActionsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(DevelopmentActionList)
