import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import Modals from '~/modules/admin/components/Modals'
import { MappingModal } from './MappingModal'
import { MappingsFilters } from './MappingsFilters'
import { MappingsTable } from './MappingsTable'
import { TaxonomyImportModal } from './TaxonomyImportModal'
import { Tabs } from '../Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'

const MODALS = {
  MappingModal,
  TaxonomyImportModal,
}
const connecter = connect(
  (state: RootState) => ({
    features: getFeatures(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window

const JobRoles: React.FC<PropsFromRedux> = ({ features, openModal }) => {
  const { projectId } = useParams()

  const config = {
    trackUrl: true,
    apiConfig: {
      include: ['project', 'job_role', 'skill'],
      include_meta: ['permissions'],
      // fields: { skills: ['name'], jobRoles: ['name'] },
      ...(projectId ? { project_id: projectId } : {}),
    },
  }

  const handleOpenModal = (mapping) => {
    openModal('MappingModal', { mapping })
  }

  return (
    <>
      {!projectId && (
        <Breadcrumb
          crumbs={[
            {
              link: () => '/admin',
              label: () => I18n.t('users.dashboard'),
            },
            {
              label: () => I18n.t('administration.navigation.skills_taxonomy'),
            },
          ]}
        />
      )}
      { !projectId && <Tabs featureFlags={features} />}
      <Resource config={config} name="skills_job_roles">
        <MappingsFilters openModal={openModal} />
        <MappingsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(JobRoles)
