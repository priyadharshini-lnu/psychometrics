import { UserIdpSkill, Skill } from 'components/IdpShared/DevelopmentActions'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Spin } from 'antd'
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
  selfRatingEnabled,
  isSubmittingPlan = false,
}) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<UserIdpSkill[]>(([]))
  const [isSkillsLoading, setIsSkillsLoading] = useState(true)

  const handleAddSkill = (skills) => {
    // Add skillId to skills
    const userIdpSkill = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
    }))

    setSelectedSkills(_.uniqBy([...selectedSkills, ...userIdpSkill], 'skillId'))
  }

  const handleDeselectSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(userIdpSkill => userIdpSkill.skillId !== skillId))
  }

  const skillCategories = _.map(_.groupBy(skills, 'category'), (skills, category) => ({
    category,
    skills,
  }))

  const handleFinishAddinSkill = () => {
    setIsSubmitting(true)

    addUserIdpSkills(selectedSkills).then(() => {
      setIsSubmitting(false)
      next()
    })
  }

  useEffect(() => {
    setIsSkillsLoading(true)
    fetchIdpSkills().then(({ response }) => {
      setSkills(response)
    }).finally(() => {
      setIsSkillsLoading(false)
    })
  }, [])

  useEffect(() => {
    setSelectedSkills(
      _.map(userIdpSkills, userIdpSkill => userIdpSkill),
    )
  }, [userIdpSkills, skills])


  return isSkillsLoading ? (
    <div className="flex justify-center items-center h-100">
      <Spin />
    </div>
  ) : (
    <AddSkillsStep
      addSkillButtonText={
        selfRatingEnabled ? I18n.t('idp.initial_steps.continue_to_rate_skills') : I18n.t('idp.initial_steps.next')}
      onAddSkill={handleAddSkill}
      selectedSkills={selectedSkills}
      skillCategories={skillCategories}
      onDeselectSkill={handleDeselectSkill}
      onFinishAddSkill={handleFinishAddinSkill}
      isSubmitting={isSubmittingPlan || isSubmitting}
    />
  )
}

export const AddSkills = connector(AddSkillsComponent)
