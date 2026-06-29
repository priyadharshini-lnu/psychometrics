import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import Modals from '~/modules/admin/components/Modals'
import { ProficiencyModal } from './ProficiencyModal'
import { ProficiencyFilters } from './ProficiencyFilters'
import { ProficiencyTable } from './ProficiencyTable'
import { ProficiencyImportModal } from './ProficiencyImportModal'
import { ProficiencyLevelTR } from '../../../client/core/proficiencyLevels'
import { Tabs } from '../Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'

const MODALS = {
  ProficiencyModal,
  ProficiencyImportModal,
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

const Proficiency: React.FC<PropsFromRedux> = ({ features, openModal }) => {
  const { projectId } = useParams()

  const config = {
    trackUrl: true,
    responseType: ProficiencyLevelTR,
    apiConfig: {
      include: ['project', 'skill'],
      include_meta: ['permissions'],
      fields: { skills: ['name'] },
      ...(projectId ? { project_id: projectId } : {}),
    },
  }

  const handleOpenModal = (proficiencyLevel) => {
    openModal('ProficiencyModal', { proficiencyLevel })
  }

  return (
    <>
      {!projectId && (
        <Breadcrumb
          crumbs={[
            {
              link: () => '/admin',
              label: () => I18n.t('admin.dashboard'),
            },
            {
              label: () => I18n.t('admin.navigation_skills_taxonomy'),
            },
          ]}
        />
      )}
      { !projectId && <Tabs featureFlags={features} />}
      <Resource config={config} name="proficiency_levels">
        <ProficiencyFilters openModal={openModal} />
        <ProficiencyTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(Proficiency)
