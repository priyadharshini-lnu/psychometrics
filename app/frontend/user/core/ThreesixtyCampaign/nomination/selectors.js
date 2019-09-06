import _ from 'lodash'
import { createSelector } from 'reselect'

export const getConditions = state => state.nomination.requirements.conditions || []
export const getEvaluators = state => state.nomination.evaluators
export const getRelationships = state => state.nomination.relationships

export const requirementsSelector = createSelector(
  getConditions, getEvaluators, getRelationships,
  (conditions, evaluators, relationships) => {
    const groups = _.compact(
      _.map(conditions, (condition) => {
        const { name } = _.find(relationships, { id: condition.relationshipId })
        if (name === 'Self') { return false }
        return { condition, title: name, evaluators: evaluators[name] }
      }),
    )
    _.each(evaluators, (evaluators, name) => {
      if (_.find(groups, { title: name }) || name === 'Self') { return }
      const { id } = _.find(relationships, { name })
      groups.push({ condition: { withoutConditions: true, relationshipId: id }, title: name, evaluators })
    })
    return groups
  },
)
