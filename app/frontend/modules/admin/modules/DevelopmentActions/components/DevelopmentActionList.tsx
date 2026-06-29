import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { DevelopmentActionTR, DevelopmentAction } from '~/modules/admin/modules/client/core/developmentAction'
import { Resource } from '~/modules/admin/components/Resource'
import { DevelopmentActionsFormModal } from './DevelopmentActionsFormModal'
import { DevelopmentActionsTable } from './DevelopmentActionsTable'
import { DevelopmentActionsFilter } from './DevelopmentActionsFilter'
import { DevelopmentActionsImportModal } from './DevelopmentActionsImportModal'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const connector = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

const MODALS = {
  DevelopmentActionsFormModal,
  DevelopmentActionsImportModal,
}

const { I18n } = window

const DevelopmentActionList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { projectId: projectIdParam } = useParams()

  let filter
  if (projectIdParam) {
    filter = {
      project_id_eq: projectIdParam,
    }
  } else {
    filter = {
      global: true,
    }
  }

  const config = {
    trackUrl: true,
    responseType: DevelopmentActionTR,
    apiConfig: {
      include: ['skills'],
      include_meta: ['permissions'],
      filter,
      include_resource_meta: ['permissions'],
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
              label: () => I18n.t('admin.dashboard'),
            },
            {
              label: () => I18n.t('admin.development_actions_heading'),
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

export default connector(DevelopmentActionList)
