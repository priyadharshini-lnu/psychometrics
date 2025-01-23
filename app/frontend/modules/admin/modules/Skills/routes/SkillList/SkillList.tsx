import React, { useState } from 'react'
import { Skill, SkillTR } from '~/modules/admin/modules/client/core/skill'
import { Resource } from '~/modules/admin/components/Resource'
import { SkillsBreadcrumb } from './SkillsBreadcrumb'
import { SkillsFormModal } from './SkillsFormModal'
import { SkillsTable } from './SkillsTable'
import { SkillsFilter } from './SkillsFilter'

const SkillList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill>()
  const config = {
    trackUrl: true,
    responseType: SkillTR,
    apiConfig: {
      include: ['owner'],
    },
  }
  const openModal = (skill: Skill) => {
    setSelectedSkill(skill)
    setIsModalOpen(true)
  }
  return (
    <>
      <Resource config={config} name="skills">
        <SkillsBreadcrumb />
        <SkillsFilter openModal={() => setIsModalOpen(true)} />
        <SkillsTable openModal={openModal} />
        {isModalOpen && (
          <SkillsFormModal
            skill={selectedSkill}
            close={() => {
              setSelectedSkill(undefined)
              setIsModalOpen(false)
            }}
          />
        )}
      </Resource>
    </>
  )
}

export default SkillList
