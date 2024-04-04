import _ from 'lodash'
import {
  CategoryWithDevelopmentActions,
  CategoryWithSkills,
  DevelopmentAction,
  DevelopmentActionWithSkill,
  Skill,
  SkillWithDevelopmentActions,
} from '~/components/IdpShared/DevelopmentActions'

function addDevelopmentActionsToSkills (
  skills: Record<string, Skill>,
  developmentActions: Record<string, DevelopmentAction>,
):SkillWithDevelopmentActions[] {
  const groupedSkills = _.groupBy(developmentActions, 'userIdpSkillId')
  return _.map(skills, skill => ({
    ...skill,
    development_actions: groupedSkills[skill.id] || [],
  }))
}

function addSkillsToDevelopmentActions (
  developmentActions: Record<string, DevelopmentAction>,
  skills: Record<string, Skill>,
): DevelopmentActionWithSkill[] {
  return _.map(developmentActions, developmentAction => ({
    ...developmentAction,
    skill: skills[developmentAction.userIdpSkillId],
  }))
}

export function groupDevelopmentActionsByCategory (
  developmentActions: Record<string, DevelopmentAction>,
  skills: Record<string, Skill>,
): CategoryWithDevelopmentActions[] {
  if (_.isEmpty(developmentActions) || _.isEmpty(skills)) return []
  const enrichedDevelopmentActions = addSkillsToDevelopmentActions(developmentActions, skills)
  const groupedByCategory = _.groupBy(enrichedDevelopmentActions, developmentAction => developmentAction.skill.category)

  return _.map(groupedByCategory, (developmentActions, category) => ({
    category,
    developmentActions,
  }))
}
export function groupSkillsByCategory (
  skills: Record<string, Skill>,
  developmentActions: Record<string, DevelopmentAction>,
): CategoryWithSkills[] {
  const enrichedSkills = addDevelopmentActionsToSkills(skills, developmentActions)
  const groupedByCategory = _.groupBy(enrichedSkills, 'category')

  return _.map(groupedByCategory, (skills, category) => ({
    category,
    skills,
  }))
}
