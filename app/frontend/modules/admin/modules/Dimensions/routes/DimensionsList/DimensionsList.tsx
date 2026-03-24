import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { DimensionTR } from '~/modules/admin/modules/client/core/dimensions'
import { Resource } from '~/modules/admin/components/Resource'
import { DimensionsFormModal } from './DimensionsFormModal'
import { DimensionsTable } from './DimensionsTable'
import { DimensionsFilter } from './DimensionsFilter'
import { RemoveDimensionModal } from './RemoveDimensionModal'
import { DimensionsBreadcrumb } from './DimensionsBreadcrumb'

const MODALS = {
  DimensionsFormModal,
  RemoveDimensionModal,
}

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const DimensionList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const config = {
    trackUrl: true,
    responseType: DimensionTR,
    apiConfig: {
      include: ['owner'],
    },
  }

  return (
    <>
      <Resource config={config} name="dimensions">
        <DimensionsBreadcrumb />
        <DimensionsFilter openModal={openModal} />
        <DimensionsTable openModal={openModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(DimensionList)
