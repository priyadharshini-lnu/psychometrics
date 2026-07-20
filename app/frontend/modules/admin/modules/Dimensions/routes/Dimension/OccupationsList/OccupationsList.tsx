import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import { OccupationsTable } from './OccupationsTable'
import { OccupationsFilter } from './OccupationsFilter'
import { OccupationsFormModal } from './OccupationsFormModal'
import { RemoveOccupationsModal } from './RemoveOccupationsModal'
import { OccupationTR } from '~/modules/admin/modules/campaigns/core/occupations'

const MODALS = {
  OccupationsFormModal,
  RemoveOccupationsModal,
}

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const OccupationsList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { dimensionId } = useParams() as { dimensionId: string }

  const config = {
    basePath: `dimensions/${dimensionId}/`,
    trackUrl: true,
    responseType: OccupationTR,
  }

  return (
    <>
      <Resource config={config} name="occupations">
        <OccupationsFilter openModal={openModal} />
        <OccupationsTable openModal={openModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(OccupationsList)
