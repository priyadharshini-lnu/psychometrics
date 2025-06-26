import React from 'react'
import { useParams } from 'react-router'
import { connect, ConnectedProps } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Skill, SkillTR } from '~/modules/admin/modules/client/core/skills'
import { Resource } from '~/modules/admin/components/Resource'
import { SkillsFormModal } from './SkillsFormModal'
import { SkillsTable } from './SkillsTable'
import { SkillsFilter } from './SkillsFilter'
import { SkillsImportModal } from './SkillsImportModal'
import { SkillsExportModal } from './SkillsExportModal'
import { Tabs } from '../Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'

const MODALS = {
  SkillsImportModal,
  SkillsFormModal,
  SkillsExportModal,
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

const SkillList: React.FC<PropsFromRedux> = ({ features, openModal }) => {
  const { projectId: projectIdParam } = useParams()

  let projectIdFilter
  if (projectIdParam) {
    projectIdFilter = {
      project_id_eq: projectIdParam,
    }
  }

  const config = {
    trackUrl: true,
    responseType: SkillTR,
    apiConfig: {
      include: ['project', 'skill_group'],
      include_meta: ['permissions'],
      filter: projectIdFilter,
      fields: { projects: ['name', 'client_id'], skill_groups: ['name'] },
    },
  }

  const handleOpenModal = (skill?: Skill) => {
    openModal('SkillsFormModal', { skill })
  }

  return (
    <>
      {!projectIdParam && (
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
      { !projectIdParam && <Tabs featureFlags={features} />}
      <Resource config={config} name="skills">
        <SkillsFilter openModal={openModal} />
        <SkillsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(SkillList)
