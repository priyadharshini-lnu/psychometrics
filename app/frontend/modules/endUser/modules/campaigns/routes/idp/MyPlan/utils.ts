import _ from 'lodash'
import {
  CategoryWithDevelopmentActions,
  TypeWithSkills,
  DevelopmentAction,
  DevelopmentActionWithSkill,
  Skill,
  SkillWithDevelopmentActions,
} from '~/components/IdpShared/DevelopmentActions'

function addDevelopmentActionsToSkills (
  skills: Record<string, Skill>,
  developmentActions: Record<string, DevelopmentAction>,
  groupByOption = 'userIdpSkillId',
):SkillWithDevelopmentActions[] {
  const groupedSkills = _.groupBy(developmentActions, groupByOption)
  return _.map(skills, skill => ({
    ...skill,
    // skill here can be either Skill or UserIdpSkill, it's important to maintain skillId if present
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    skillId: skill?.skillId || skill.id,
    developmentActions: groupedSkills[skill.id] || [],
  }))
}

function addSkillsToDevelopmentActions (
  developmentActions: Record<string, DevelopmentAction>,
  skills: Record<string, Skill>,
  groupByOption:string,
): DevelopmentActionWithSkill[] {
  return _.map(developmentActions, developmentAction => ({
    ...developmentAction,
    skill: skills[developmentAction[groupByOption]],
  }))
}

export function groupDevelopmentActionsBySkillType (
  developmentActions: Record<string, DevelopmentAction>,
  skills: Record<string, Skill>,
  groupByOption = 'userIdpSkillId',
): CategoryWithDevelopmentActions[] {
  if (_.isEmpty(developmentActions) || _.isEmpty(skills)) return []
  const enrichedDevelopmentActions = addSkillsToDevelopmentActions(developmentActions, skills, groupByOption)
  const groupedByCategory = _.groupBy(enrichedDevelopmentActions,
    developmentAction => developmentAction.skill.skillType)

  return _.map(groupedByCategory, (developmentActions, developmentActionType) => ({
    developmentActionType,
    developmentActions,
  }))
}
export function groupSkillsBySkillType (
  skills: Record<string, Skill>,
  developmentActions: Record<string, DevelopmentAction>,
  groupByOption = 'userIdpSkillId',
): TypeWithSkills[] {
  const enrichedSkills = addDevelopmentActionsToSkills(skills, developmentActions, groupByOption)
  const groupedBySkillType = _.groupBy(enrichedSkills, 'skillType')

  return _.map(groupedBySkillType, (skills, skillType) => ({
    skillType,
    skills,
  }))
}

export const filteredDevelopmentActions = (idpDevelopmentActions: Record<string, DevelopmentAction>) => {
  const filteredValue = _.mapValues(idpDevelopmentActions, (action) => {
    if (action.localData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, localData, ...restOfAction } = action
      return restOfAction
    }
    return { ...action }
  })
  return filteredValue
}
