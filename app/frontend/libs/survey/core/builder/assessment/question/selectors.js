import { createSelector } from 'reselect'
import ModuleConfigs from 'constants/ModuleConfigs'

export const selectQuestion = (state, id) => state.questions[id]

export const moduleConfig = createSelector(
  selectQuestion,
  question => ModuleConfigs[question.type] || {},
)
