import { useEffect, useState, useMemo } from 'react'
import _ from 'lodash'
import { Spin } from 'antd'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import { useResources } from '~/hooks/useResources'
import { useSearchSkills } from './useSearchSkills'
import { UserIdpSkills } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

const { I18n } = window

export const AdminAddSkills = ({
  userIdpSkills,
  next,
  idpTemplateId,
}: {
  userIdpSkills:UserIdpSkills[],
  next: (selectedSkills:UserIdpSkills[])=>void,
  idpTemplateId:string
}) => {
  const [skills, setSkills] = useState<UserIdpSkills[]>([])
  const [selectedSkills, setSelectedSkills] = useState<UserIdpSkills[]>(([]))
  const [isSkillsLoading, setIsSkillsLoading] = useState(false)

  const searchSkillResource = useSearchSkills(idpTemplateId)

  const {
    fetch: fetchIdpSkillDetails,
  } = useResources<UserIdpSkills>(
    'skills', {
      apiConfig: {
        include: ['development_actions'],
        page: {
          size: 25,
        },
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
        // We can add page size instead of getting all the skills at once but there could be case
        // that not all technical skills present in initial batch
        // page: {
        //   size: 25,
        // },
        filter: {
          by_idp_template_id: idpTemplateId as string,
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

    setSelectedSkills(_.uniqBy([...selectedSkills, ...userIdpSkill], 'skillId'))
  }

  const handleDeselectSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter((userIdpSkill:UserIdpSkills) => userIdpSkill.skillId !== skillId))
  }

  const skillTypes = _.map(_.groupBy(skills, 'skillType'), (skills, skillType) => ({
    skillType,
    skills,
  }))

  const handleFinishAddinSkill = () => {
    next(selectedSkills)
  }

  useEffect(() => {
    setSelectedSkills(
      _.map(normalizedUserIdpSkills, (userIdpSkill:UserIdpSkills) => ({ ...userIdpSkill, skillId: userIdpSkill.id })),
    )
  }, [normalizedUserIdpSkills, skills])


  return isSkillsLoading ? (
    <div style={{ height: '80vh' }} className="flex justify-center items-center h-100">
      <Spin size="large" />
    </div>
  ) : (
    <AddSkillsStep
      addSkillButtonText={I18n.t('idp.initial_steps.save')}
      onAddSkill={handleAddSkill}
      selectedSkills={selectedSkills}
      skillTypes={skillTypes}
      onDeselectSkill={handleDeselectSkill}
      onFinishAddSkill={handleFinishAddinSkill}
      searchSkillResource={searchSkillResource}
    />
  )
}
