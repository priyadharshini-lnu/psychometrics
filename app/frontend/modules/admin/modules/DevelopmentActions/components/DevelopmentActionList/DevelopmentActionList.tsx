import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { DevelopmentActionTR, DevelopmentAction } from '~/modules/admin/modules/client/core/developmentAction'
import { Resource } from '~/modules/admin/components/Resource'
import { DevelopmentActionsBreadcrumb } from '../DevelopmentActionsBreadcrumb'
import { DevelopmentActionsFormModal } from '../DevelopmentActionsFormModal'
import { DevelopmentActionsExportModal } from '../DevelopmentActionsExportModal'
import { DevelopmentActionsTable } from '../DevelopmentActionsTable'
import { DevelopmentActionsFilter } from '../DevelopmentActionsFilter'
import { DevelopmentActionsImportModal } from '../DevelopmentActionsImportModal'


const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const MODALS = {
  DevelopmentActionsFormModal,
  DevelopmentActionsImportModal,
  DevelopmentActionsExportModal,
}

const DevelopmentActionList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { projectId } = useParams()

  let projectIdFilter
  if (projectId) {
    projectIdFilter = {
      project_id_eq: projectId,
    }
  }

  const config = {
    trackUrl: true,
    responseType: DevelopmentActionTR,
    apiConfig: {
      include: ['project', 'skills'],
      include_meta: ['permissions'],
      filter: projectIdFilter,
    },
  }


  const handleOpenModal = (developmentAction?: DevelopmentAction) => {
    openModal('DevelopmentActionsFormModal', { developmentAction })
  }

  return (
    <>
      <Resource config={config} name="development_actions">
        {!projectId && <DevelopmentActionsBreadcrumb />}
        <DevelopmentActionsFilter openModal={openModal} />
        <DevelopmentActionsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(DevelopmentActionList)
