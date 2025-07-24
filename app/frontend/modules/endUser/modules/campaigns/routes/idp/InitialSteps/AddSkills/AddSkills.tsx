import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Spin } from 'antd'
import { Skill } from '~/components/IdpShared/DevelopmentActions'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import {
  fetchIdpSkills,
  saveUserIdpSkills,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { useSearchSkills } from './useSearchSkills'

const connector = connect((state: RootState) => ({
  userIdpSkills: state.campaigns.idp.userIdpSkills,
}),
{
  fetchIdpSkills,
  saveUserIdpSkills,
})

const { I18n } = window

const AddSkillsComponent = ({
  next,
  fetchIdpSkills,
  saveUserIdpSkills,
  userIdpSkills,
  selfRatingEnabled,
  isSubmittingPlan = false,
}) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(([]))
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

  const skillTypes = _.map(_.groupBy(skills, 'skillType'), (skills, skillType) => ({
    skillType,
    skills,
  }))

  const handleFinishAddinSkill = () => {
    setIsSubmitting(true)

    saveUserIdpSkills(selectedSkills).then(() => {
      setIsSubmitting(false)
      next()
    })
  }
  const searchSkillResource = useSearchSkills()

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
      skillTypes={skillTypes}
      onDeselectSkill={handleDeselectSkill}
      onFinishAddSkill={handleFinishAddinSkill}
      isSubmitting={isSubmittingPlan || isSubmitting}
      searchSkillResource={searchSkillResource}
    />
  )
}

export const AddSkills = connector(AddSkillsComponent)
