import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { uniqBy, groupBy, map } from 'lodash'
import { message } from 'antd'
import { Skill } from '~/components/IdpShared/DevelopmentActions'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import {
  fetchIdpSkills,
  saveUserIdpSkills,
  fetchSkillGaps,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { useSearchSkills } from './useSearchSkills'

const connector = connect((state: RootState) => ({
  userIdpSkills: state.campaigns.idp.userIdpSkills,
  currentUser: state.currentUser,
  skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
  skillGapReportData: state.campaigns.idp.skillGapReportData,
}),
{
  fetchIdpSkills,
  saveUserIdpSkills,
  fetchSkillGaps,
})

const { I18n } = window

const AddSkillsComponent = ({
  next,
  fetchIdpSkills,
  saveUserIdpSkills,
  userIdpSkills,
  selfRatingEnabled,
  isSubmittingPlan = false,
  skillGapReportData,
  currentUser,
  skillGapReportAvailable,
  prev,
  fetchSkillGaps,
}) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(([]))
  const [isSkillsLoading, setIsSkillsLoading] = useState(true)
  const [isSkillGapReportLoading, setIsSkillGapReportLoading] = useState(false)

  const handleAddSkill = (skills) => {
    // Add skillId to skills
    const userIdpSkill = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
    }))

    setSelectedSkills(uniqBy([...selectedSkills, ...userIdpSkill], 'skillId'))
  }

  const handleDeselectSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(userIdpSkill => userIdpSkill.id !== skillId
      && userIdpSkill.skillId !== skillId))
  }

  const skillTypes = map(groupBy(skills, 'skillType'), (skills, skillType) => ({
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

    if (!skillGapReportData && skillGapReportAvailable) {
      setIsSkillGapReportLoading(true)
      fetchSkillGaps(currentUser.id, { lang: I18n.locale }).catch((error) => {
        message.error(error[0].base)
      }).finally(() => {
        setIsSkillGapReportLoading(false)
      })
    }
  }, [])

  useEffect(() => {
    setSelectedSkills(
      map(userIdpSkills, userIdpSkill => userIdpSkill),
    )
  }, [userIdpSkills, skills])


  return (
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
      skillGapReportData={skillGapReportData}
      prev={prev}
      isSkillGapReportLoading={isSkillGapReportLoading}
      skillGapReportAvailable={skillGapReportAvailable}
      isSkillsLoading={isSkillsLoading}
    />
  )
}

export const AddSkills = connector(AddSkillsComponent)
