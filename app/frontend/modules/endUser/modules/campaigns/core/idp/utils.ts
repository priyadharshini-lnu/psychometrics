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
