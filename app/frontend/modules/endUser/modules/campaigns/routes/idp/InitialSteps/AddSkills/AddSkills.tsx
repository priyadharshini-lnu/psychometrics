import { useEffect } from 'react'
import { AddSkillsStep } from '~/components/IdpShared/InitialSteps/AddSkillsStep'

const { I18n } = window

export const AddSkills = ({ next }) => {
  useEffect(() => {
    // fetch saved skills
  }, [])

  return (
    <AddSkillsStep
      addSkillButtonText={I18n.t('idp.initial_steps.continue_to_rate_skills')}
      onAddSkill={next}
      selectedSkills={[]}
      skillCategories={[]}
      onDeselectSkill={() => {}}
      onFinishAddSkill={() => {}}
    />
  )
}
