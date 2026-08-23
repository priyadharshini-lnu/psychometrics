import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { JobRolesFilters } from './JobRolesFilters'
import { JobRolesTable } from './JobRolesTable'
import { JobRolesFormModal } from './JobRolesFormModal'
import Modals from '~/modules/admin/components/Modals'
import { JobRolesImportModal } from './JobRolesImportModal'
import { Tabs } from '../Tabs'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'

const { I18n } = window

const MODALS = {
  JobRolesFormModal,
  JobRolesImportModal,
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

const JobRoles: React.FC<PropsFromRedux> = ({ features, openModal }) => {
  const { projectId } = useParams()

  const config = {
    trackUrl: true,
    apiConfig: {
      include: ['project', 'job_group'],
      include_meta: ['permissions'],
      fields: { projects: ['name'], job_group: ['name'] },
      ...(projectId ? { project_id: projectId } : {}),
    },
  }

  const handleOpenModal = (jobRole) => {
    openModal('JobRolesFormModal', { jobRole })
  }

  return (
    <>
      { !projectId && <Tabs featureFlags={features} />}
      <Resource
        title={I18n.t('admin.job_roles')}
        config={config}
        name="job_roles"
        settingsKey={TABLE_SETTINGS_KEYS.adminSkillsJobRoles}
      >
        <JobRolesFilters openModal={openModal} />
        <JobRolesTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(JobRoles)
