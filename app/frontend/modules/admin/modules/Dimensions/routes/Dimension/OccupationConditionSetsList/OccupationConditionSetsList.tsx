import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import { OccupationConditionSetsTable } from './OccupationConditionSetsTable'
import { OccupationConditionSetsFilter } from './OccupationConditionSetsFilter'
import { OccupationConditionSetsFormModal } from './OccupationConditionSetsFormModal'
import { RemoveOccupationConditionSetsFormModal } from './RemoveOccupationConditionSetsFormModal'
import { OccupationConditionSetTR } from './interfaces'
import { openModal } from '~/modules/admin/core/ui/modals'

const MODALS = {
  OccupationConditionSetsFormModal,
  RemoveOccupationConditionSetsFormModal,
}

export const OccupationConditionSetsList: React.FC = () => {
  const { dimensionId } = useParams() as { dimensionId: string }
  const dispatch = useDispatch()

  const config = {
    basePath: `dimensions/${dimensionId}`,
    trackUrl: true,
    responseType: OccupationConditionSetTR,
  }

  return (
    <Resource config={config} name="occupation_condition_sets">
      <OccupationConditionSetsFilter openModal={name => dispatch(openModal(name))} />
      <OccupationConditionSetsTable />
      <Modals modals={MODALS} />
    </Resource>
  )
}
