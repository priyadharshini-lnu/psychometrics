import { UserIdpSkill, Skill } from 'components/IdpShared/DevelopmentActions'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { AddSkillsStep } from '~/components/IdpShared/InitialSteps/AddSkillsStep'
import {
  fetchIdpSkills,
  addUserIdpSkills,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'

const connector = connect((state: RootState) => ({
  userIdpSkills: state.campaigns.idp.userIdpSkills,
}),
{
  fetchIdpSkills,
  addUserIdpSkills,
})

const { I18n } = window

const AddSkillsComponent = ({
  next,
  fetchIdpSkills,
  addUserIdpSkills,
  userIdpSkills,
}) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<UserIdpSkill[]>(([]))

  const handleAddSkill = (skill) => {
    setSelectedSkills([...selectedSkills, ...skill])
  }

  const handleDeselectSkill = (id) => {
    setSelectedSkills(selectedSkills.filter(skill => skill.id !== id))
  }

  const skillCategories = _.map(_.groupBy(skills, 'category'), (skills, category) => ({
    category,
    skills,
  }))

  const handleFinishAddinSkill = () => {
    // if newsly added skill, skillId is null
    const skills = selectedSkills.map(skill => ({
      ...skill,
      skillId: skill.skillId ?? skill.id,
    }))
    setIsSubmitting(true)

    addUserIdpSkills(skills).then(() => {
      setIsSubmitting(false)
      next()
    })
  }

  useEffect(() => {
    fetchIdpSkills().then(({ response }) => {
      setSkills(response)
    })
  }, [])

  useEffect(() => {
    setSelectedSkills(
      _.map(userIdpSkills, userIdpSkill => userIdpSkill),
    )
  }, [userIdpSkills, skills])

  return (
    <AddSkillsStep
      addSkillButtonText={I18n.t('idp.initial_steps.continue_to_rate_skills')}
      onAddSkill={handleAddSkill}
      selectedSkills={selectedSkills}
      skillCategories={skillCategories}
      onDeselectSkill={handleDeselectSkill}
      onFinishAddSkill={handleFinishAddinSkill}
      isSubmitting={isSubmitting}
    />
  )
}

export const AddSkills = connector(AddSkillsComponent)
