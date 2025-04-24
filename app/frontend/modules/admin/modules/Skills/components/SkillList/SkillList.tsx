import React from 'react'
import { useParams } from 'react-router'
import { connect, ConnectedProps } from 'react-redux'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { Skill, SkillTR } from '~/modules/admin/modules/client/core/skills'
import { Resource } from '~/modules/admin/components/Resource'
import { SkillsBreadcrumb } from '../SkillsBreadcrumb'
import { SkillsFormModal } from '../SkillsFormModal'
import { SkillsTable } from '../SkillsTable'
import { SkillsFilter } from '../SkillsFilter'
import { SkillsImportModal } from '../SkillsImportModal'
import { SkillsExportModal } from '../SkillsExportModal'

const MODALS = {
  SkillsImportModal,
  SkillsFormModal,
  SkillsExportModal,
}

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const SkillList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { projectId } = useParams()

  let projectIdFilter
  if (projectId) {
    projectIdFilter = {
      project_id_eq: projectId,
    }
  }

  const config = {
    trackUrl: true,
    responseType: SkillTR,
    apiConfig: {
      include: ['project'],
      include_meta: ['permissions'],
      filter: projectIdFilter,
      fields: { projects: ['name'] },
    },
  }


  const handleOpenModal = (skill?: Skill) => {
    openModal('SkillsFormModal', { skill })
  }

  return (
    <>
      <Resource config={config} name="skills">
        {!projectId && <SkillsBreadcrumb />}
        <SkillsFilter openModal={openModal} />
        <SkillsTable openModal={handleOpenModal} />
        <Modals modals={MODALS} />

      </Resource>
    </>
  )
}

export default connecter(SkillList)
