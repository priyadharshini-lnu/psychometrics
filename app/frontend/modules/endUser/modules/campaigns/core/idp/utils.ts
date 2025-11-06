import dayjs from 'dayjs'

const { I18n } = window

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

export const ActionStatusInfo = {
  [PlanChangeStatus.ADDED]: I18n.t('idp.added_development_action'),
  [PlanChangeStatus.EDITED]: I18n.t('idp.modified_development_action'),
  [PlanChangeStatus.REMOVED]: I18n.t('idp.removed_development_action'),
}
const FORMAT = 'DD MMM YYYY'

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

export const normalizePlanChangesForSummary = (planChanges) => {
  const { diff, error } = planChanges

  if (error) {
    return { message: error }
  }
  const { skillsDiff, actionsDiff } = diff.planChanges

  if (planChanges.error) { return {} }
  const summarisedPlanChanges = {}

  skillsDiff.created.forEach((skill) => {
    summarisedPlanChanges[skill.name] = {
      changeStatus: PlanChangeStatus.ADDED,
    }
  })

  skillsDiff.updated.forEach((skill) => {
    summarisedPlanChanges[skill.name] = {
      changeStatus: PlanChangeStatus.EDITED,
      actions: actionsDiff.updated.filter(action => action.userIdpSkillId
        === skill.id).map((action) => {
        const changes:string[] = []
        if (action.changes.startDateTime) {
          changes.push(
            `<b>${action.name}</b>: ${I18n.t('idp.history.changes.start_date',
              {
                from: action.changes.startDateTime.from
                  ? dayjs(action.changes.startDateTime.from).format(FORMAT) : "'-'",
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
        return {
          ...action,
          changeStatus: PlanChangeStatus.EDITED,
          changeLog: changes,
        }
      }),
    }
  })

  skillsDiff.deleted.forEach((action) => {
    summarisedPlanChanges[action.name] = {
      changeStatus: PlanChangeStatus.REMOVED,
    }
  })

  actionsDiff.created.forEach((action) => {
    summarisedPlanChanges[action.skillName] = {
      changeStatus: PlanChangeStatus.ADDED,
      actions: [
        ...(summarisedPlanChanges[action.skillName]?.actions || []),
        { ...action, changeStatus: PlanChangeStatus.ADDED },
      ],
    }
  })

  actionsDiff.deleted.forEach((action) => {
    summarisedPlanChanges[action.skillName] = {
      changeStatus: PlanChangeStatus.REMOVED,
      actions: [
        ...(summarisedPlanChanges[action.skillName]?.actions || []),
        { ...action, changeStatus: PlanChangeStatus.REMOVED },
      ],
    }
  })

  actionsDiff.updated.forEach((action) => {
    const changes:string[] = []
    if (action.changes.startDateTime) {
      changes.push(
        `${I18n.t('idp.history.changes.start_date',
          {
            from: action.changes.startDateTime.from ? dayjs(action.changes.startDateTime.from).format(FORMAT) : "'-'",
            to: action.changes.startDateTime.to ? dayjs(action.changes.startDateTime.to).format(FORMAT) : "'-'",
          })}`,
      )
    }
    if (action.changes.endDateTime) {
      changes.push(
        `${I18n.t('idp.history.changes.end_date',
          {
            from: action.changes.endDateTime.from ? dayjs(action.changes.endDateTime.from).format(FORMAT) : "'-'",
            to: action.changes.endDateTime.to ? dayjs(action.changes.endDateTime.to).format(FORMAT) : "'-'",
          })}`,
      )
    }
    summarisedPlanChanges[action.skillName] = {
      changeStatus: PlanChangeStatus.EDITED,
      actions: [
        ...(summarisedPlanChanges[action.skillName]?.actions || []),
        { ...action, changeStatus: PlanChangeStatus.EDITED, changeLog: changes },
      ],
    }
  })

  return summarisedPlanChanges
}
