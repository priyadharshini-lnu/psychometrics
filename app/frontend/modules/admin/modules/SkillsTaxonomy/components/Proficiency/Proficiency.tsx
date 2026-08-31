import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import Modals from '~/modules/admin/components/Modals'
import { ProficiencyModal } from './ProficiencyModal'
import { ProficiencyFilters } from './ProficiencyFilters'
import { ProficiencyTable } from './ProficiencyTable'
import { ProficiencyImportModal } from './ProficiencyImportModal'
import { ProficiencyLevelTR } from '../../../client/core/proficiencyLevels'
import { Tabs } from '../Tabs'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

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
      {!projectId && <DocumentTitle text={I18n.t('admin.proficiency_levels')} />}
      { !projectId && <Tabs featureFlags={features} />}
      <Resource
        title={I18n.t('admin.proficiency_levels')}
        config={config}
        name="proficiency_levels"
        settingsKey={TABLE_SETTINGS_KEYS.adminSkillsProficiencyLevels}
      >
        <ProficiencyFilters openModal={openModal} />
        <ProficiencyTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(Proficiency)
