import { useEffect, useState, useMemo } from 'react'
import { uniqBy, map } from 'lodash'
import {
  useParams,
} from 'react-router-dom'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import { SKILL_TYPE } from '~/components/IdpShared/constants'
import { useResources } from '~/hooks/useResources'
import { useSearchSkills } from './useSearchSkills'
import { UserIdpSkills } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

const { I18n } = window

export const AdminAddSkills = ({
  userIdpSkills,
  next,
  prev,
  header,
}: {
  userIdpSkills:UserIdpSkills[],
  next: (selectedSkills:UserIdpSkills[])=>void,
  prev?: ()=> void
  header: React.ReactNode
}) => {
  const [skills, setSkills] = useState<UserIdpSkills[]>([])
  const [selectedSkills, setSelectedSkills] = useState<UserIdpSkills[]>(([]))
  const [isSkillsLoading, setIsSkillsLoading] = useState(false)

  const { projectId, idpPlanId } = useParams()

  const searchSkillResource = useSearchSkills(idpPlanId)

  const {
    fetch: fetchIdpSkillDetails,
  } = useResources<UserIdpSkills>(
    'skills', {
      basePath: '/idp_templates',
      apiConfig: {
        include: ['development_actions'],
      },
    },
  )

  const normalizedUserIdpSkills = useMemo(() => userIdpSkills.reduce((acc, skill) => {
    acc[skill.id] = skill
    return acc
  }, {}) ?? [], [userIdpSkills])

  useEffect(() => {
    setIsSkillsLoading(true)
    fetchIdpSkillDetails({
      apiConfig: {
        filter: {
          project_id_eq: projectId as string,
          available_skills_by_plan_id: idpPlanId as string,
        },
        include: ['development_actions'],
      },
    }).then(({ data }) => {
      setSkills(data.map(skill => ({ ...skill, skillId: skill.id })))
      setIsSkillsLoading(false)
    })
  }, [])

  const handleAddSkill = (skills) => {
    // Add skillId to skills
    const userIdpSkill = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
    }))

    setSelectedSkills(uniqBy([...selectedSkills, ...userIdpSkill], 'skillId'))
  }


  const handleDeselectSkill = (skillId) => {
    const userIdpSkills = selectedSkills.filter(
      (userIdpSkill:UserIdpSkills) => Number(userIdpSkill.skillId) !== skillId,
    )
    setSelectedSkills(userIdpSkills)
  }

  const skillTypes = [{
    skillType: SKILL_TYPE.BEHAVIORAL,
    skills: skills.filter(skill => (skill.skillType === SKILL_TYPE.BEHAVIORAL)),
  }, {
    skillType: SKILL_TYPE.TECHNICAL,
    skills: skills.filter(skill => (skill.skillType === SKILL_TYPE.TECHNICAL)),
  }]


  const handleFinishAddinSkill = () => {
    next(selectedSkills)
  }

  useEffect(() => {
    setSelectedSkills(
      map(normalizedUserIdpSkills, (userIdpSkill:UserIdpSkills) => ({ ...userIdpSkill, skillId: userIdpSkill.id })),
    )
  }, [normalizedUserIdpSkills, skills])


  return (
    <AddSkillsStep
      addSkillButtonText={I18n.t('idp.initial_steps.save')}
      onAddSkill={handleAddSkill}
      selectedSkills={selectedSkills}
      skillTypes={skillTypes}
      onDeselectSkill={handleDeselectSkill}
      onFinishAddSkill={handleFinishAddinSkill}
      skillGapReportData={null}
      searchSkillResource={searchSkillResource}
      prev={prev}
      header={header}
      isSkillsLoading={isSkillsLoading}
    />

  )
}
