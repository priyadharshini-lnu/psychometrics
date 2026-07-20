import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { useResources } from '~/hooks/useResources'
import { DimensionTR, Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { OccupationConditionSetsTable } from './OccupationConditionSetsTable'
import { OccupationConditionSetsFilter } from './OccupationConditionSetsFilter'
import { OccupationConditionSetsFormModal } from './OccupationConditionSetsFormModal'
import { RemoveOccupationConditionSetsFormModal } from './RemoveOccupationConditionSetsFormModal'
import { OccupationConditionSetTR } from './interfaces'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

const MODALS = {
  OccupationConditionSetsFormModal,
  RemoveOccupationConditionSetsFormModal,
}

const OccupationConditionSetsList: React.FC = () => {
  const { dimensionId } = useParams() as { dimensionId: string }
  const dispatch = useDispatch()

  const { fetchSingle: fetchDimension, getResource: getDimension } = useResources<Dimension>('dimensions', {
    responseType: DimensionTR,
    apiConfig: { include: ['owner'] },
  })

  useEffect(() => {
    if (dimensionId) fetchDimension({ id: dimensionId })
  }, [dimensionId])

  const dimension = getDimension(dimensionId)

  const config = {
    basePath: `dimensions/${dimensionId}`,
    trackUrl: true,
    responseType: OccupationConditionSetTR,
  }

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { link: () => '/admin', label: () => I18n.t('admin.dashboard') },
          { link: () => '/admin/dimensions', label: () => I18n.t('admin.dimensions_index_title') },
          {
            label: () => (
              <Link to={`/admin/dimensions/${dimensionId}/occupations`}>
                {dimension ? `${dimension.name} - ${I18n.t('admin.navigation_occupations')}` : ''}
              </Link>
            ),
          },
          { label: () => I18n.t('admin.occupation_condition_sets') },
        ]}
      />
      <Resource config={config} name="occupation_condition_sets">
        <OccupationConditionSetsFilter openModal={name => dispatch(openModal(name))} />
        <OccupationConditionSetsTable />
        <Modals modals={MODALS} />
      </Resource>
    </div>
  )
}

export default OccupationConditionSetsList
