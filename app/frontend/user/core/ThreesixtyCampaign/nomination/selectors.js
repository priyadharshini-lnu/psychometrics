import _ from 'lodash'
import { createSelector } from 'reselect'

export const getConditions = state => state.nomination.requirements.conditions || []
export const getEvaluators = state => state.nomination.evaluators
export const getRelationships = state => state.nomination.relationships

export const requirementsSelector = createSelector(
  getConditions, getEvaluators, getRelationships,
  (conditions, evaluators, relationships) => _.map(conditions, (condition) => {
    const { name } = _.find(relationships, { id: condition.relationshipId })
    return { condition, title: name, evaluators: evaluators[name] }
  }),
)
