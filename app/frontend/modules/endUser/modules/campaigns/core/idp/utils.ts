import dayjs from 'dayjs'

export enum PlanChangeStatus {
  ADDED= 'New',
  EDITED = 'Edited',
  REMOVED = 'Removed',
}

export const ChangeStatusColors = {
  [PlanChangeStatus.ADDED]: 'processing',
  [PlanChangeStatus.EDITED]: 'gold',
  [PlanChangeStatus.REMOVED]: 'volcano',
}
const FORMAT = 'DD MMM YYYY'

const { I18n } = window

export const updateUserIdpSkillComments = (state, resourceId, updater) => {
  if (!resourceId) return state.userIdpSkills

  return {
    ...state.userIdpSkills,
    [resourceId]: {
      ...state.userIdpSkills[resourceId],
      comments: updater(state.userIdpSkills[resourceId]?.comments || []),
    },
  }
}

export const getRequestQuery = action => action.requestAction?.request?.body?.q || {}

export const normalizePlanChanges = (planChanges, { userIdpSkills, userIdpDevelopmentActions }) => {
  if (planChanges.error || planChanges.message || !planChanges.diff) { return {} }

  const { skillsDiff, actionsDiff } = planChanges.diff.planChanges

  const userIdpSkillsWithPlanChanges = { ...userIdpSkills }
  const userIdpDevelopmentActionsWithPlanChanges = { ...userIdpDevelopmentActions }
  actionsDiff.created.forEach((action) => {
    userIdpDevelopmentActionsWithPlanChanges[action.id].changeStatus = PlanChangeStatus.ADDED
    const skill = userIdpSkillsWithPlanChanges[action.userIdpSkillId]
    if (skill) {
      skill.changeHistory = {
        ...skill.changeHistory,
        addedDA: [...(skill.changeHistory?.addedDA || []), `<b>${action.name}</b>`],
      }
    }
  })

  actionsDiff.deleted.forEach((action) => {
    userIdpDevelopmentActionsWithPlanChanges[action.id].changeStatus = PlanChangeStatus.REMOVED
    const skill = userIdpSkillsWithPlanChanges[action.userIdpSkillId]
    if (skill) {
      skill.changeHistory = {
        ...skill.changeHistory,
        removedDA: [
          ...(skill.changeHistory?.removedDA || []), `<b>${action.name}</b>`,
        ],
      }
    }
  })

  actionsDiff.updated.forEach((action) => {
    const skill = userIdpSkillsWithPlanChanges[action.userIdpSkillId]
    if (!skill) { return }
    userIdpDevelopmentActionsWithPlanChanges[action.id].changeStatus = PlanChangeStatus.EDITED

    const changes:string[] = []
    if (action.changes.startDateTime) {
      changes.push(
        `<b>${action.name}</b>: ${I18n.t('idp.history.changes.start_date',
          {
            from: action.changes.startDateTime.from ? dayjs(action.changes.startDateTime.from).format(FORMAT) : "'-'",
            to: action.changes.startDateTime.to ? dayjs(action.changes.startDateTime.to).format(FORMAT) : "'-'",
          })}`,
      )
    }
    if (action.changes.endDateTime) {
      changes.push(
        `<b>${action.name}</b>: ${I18n.t('idp.history.changes.end_date',
          {
            from: action.changes.endDateTime.from ? dayjs(action.changes.endDateTime.from).format(FORMAT) : "'-'",
            to: action.changes.endDateTime.to ? dayjs(action.changes.endDateTime.to).format(FORMAT) : "'-'",
          })}`,
      )
    }
    skill.changeHistory = {
      ...skill.changeHistory,
      updatedDA: [
        ...(skill.changeHistory?.updatedDA || []), ...changes,
      ],
    }
  })

  skillsDiff.created.forEach((action) => {
    if (!userIdpSkillsWithPlanChanges[action.id]) { return }
    userIdpSkillsWithPlanChanges[action.id].changeStatus = PlanChangeStatus.ADDED
  })

  skillsDiff.updated.forEach((action) => {
    if (!userIdpSkillsWithPlanChanges[action.id]) { return }
    userIdpSkillsWithPlanChanges[action.id].changeStatus = PlanChangeStatus.EDITED
  })
  skillsDiff.deleted.forEach((action) => {
    if (!userIdpSkillsWithPlanChanges[action.id]) { return }
    userIdpSkillsWithPlanChanges[action.id].changeStatus = PlanChangeStatus.REMOVED
  })

  return {
    userIdpSkills: userIdpSkillsWithPlanChanges,
    userIdpDevelopmentActions: userIdpDevelopmentActionsWithPlanChanges,
  }
}
