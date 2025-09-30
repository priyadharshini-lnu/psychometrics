import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { DevelopmentActionTR, DevelopmentAction } from '~/modules/admin/modules/client/core/developmentAction'
import { Resource } from '~/modules/admin/components/Resource'
import { DevelopmentActionsFormModal } from '../DevelopmentActionsFormModal'
import { DevelopmentActionsExportModal } from '../DevelopmentActionsExportModal'
import { DevelopmentActionsTable } from '../DevelopmentActionsTable'
import { DevelopmentActionsFilter } from '../DevelopmentActionsFilter'
import { DevelopmentActionsImportModal } from '../DevelopmentActionsImportModal'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

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

const { I18n } = window

const DevelopmentActionList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { projectId: projectIdParam } = useParams()

  let projectIdFilter
  if (projectIdParam) {
    projectIdFilter = {
      project_id_eq: projectIdParam,
    }
  }

  const config = {
    trackUrl: true,
    responseType: DevelopmentActionTR,
    apiConfig: {
      include: ['project', 'skills'],
      include_meta: ['permissions'],
      include_resource_meta: ['permissions'],
      filter: projectIdFilter,
    },
  }


  const handleOpenModal = (developmentAction?: DevelopmentAction) => {
    openModal('DevelopmentActionsFormModal', { developmentAction })
  }

  return (
    <>
      {!projectIdParam && (
        <Breadcrumb
          crumbs={[
            {
              link: () => '/admin',
              label: () => I18n.t('users.dashboard'),
            },
            {
              label: () => I18n.t('administration.development_actions.heading'),
            },
          ]}
        />
      )}
      <Resource config={config} name="development_actions">
        <DevelopmentActionsFilter openModal={openModal} />
        <DevelopmentActionsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(DevelopmentActionList)
