import { createSelector } from 'reselect'
import ModuleConfigs from '~/modules/survey/constants/ModuleConfigs'

export const selectQuestion = (state, id) => state.questions[id] || {}

export const moduleConfig = createSelector(
  selectQuestion,
  question => ModuleConfigs[question.type] || {},
)
