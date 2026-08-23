import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { InnovationStylesFormModal } from './InnovationStylesFormModal'
import { InnovationStylesTable } from './InnovationStylesTable'
import { InnovationStylesFilter } from './InnovationStylesFilter'
import { RemoveInnovationStylesModal } from './RemoveInnovationStylesModal'
import { InnovationStylesTR } from '~/modules/admin/modules/campaigns/core/innovationStyles'

const { I18n } = window

const MODALS = {
  InnovationStylesFormModal,
  RemoveInnovationStylesModal,
}

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const InnovationStylesList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { dimensionId } = useParams() as { dimensionId: string }

  const config = {
    basePath: `dimensions/${dimensionId}/`,
    trackUrl: true,
    responseType: InnovationStylesTR,
  }

  return (
    <>
      <Resource
        title={I18n.t('admin.navigation_innovation_styles')}
        config={config}
        name="innovation_styles"
        settingsKey={TABLE_SETTINGS_KEYS.adminDimensionsDimensionInnovationStyles}
      >
        <InnovationStylesFilter openModal={openModal} />
        <InnovationStylesTable openModal={openModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(InnovationStylesList)
