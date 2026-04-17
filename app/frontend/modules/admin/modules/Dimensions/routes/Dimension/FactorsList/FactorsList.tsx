import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import { FactorsFormModal } from './FactorsFormModal'
import { FactorsTable } from './FactorsTable'
import { FactorsFilter } from './FactorsFilter'
import { RemoveFactorModal } from './RemoveFactorModal'
import { FactorTR } from '~/modules/admin/modules/campaigns/core/factors'
import { FactorsImportModal } from './FactorsImportModal'
import { FactorTranslationsModal } from './FactorTranslationsModal'

const MODALS = {
  FactorsFormModal,
  FactorsImportModal,
  FactorTranslationsModal,
  RemoveFactorModal,
}

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const FactorsList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { dimensionId } = useParams() as { dimensionId: string }

  const config = {
    basePath: `dimensions/${dimensionId}/`,
    trackUrl: true,
    responseType: FactorTR,
    apiConfig: {
      include: ['sub_factors'],
      include_resource_meta: ['permissions'],
    },
  }

  return (
    <>
      <Resource config={config} name="factors">
        <FactorsFilter openModal={openModal} />
        <FactorsTable openModal={openModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(FactorsList)
