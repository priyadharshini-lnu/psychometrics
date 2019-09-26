import _ from 'lodash'
import { createSelector } from 'reselect'
import { relationshipWithoutSelf } from 'utils/relationship'

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


export const allowedRelationshipsForNewNominations = createSelector(
  getConditions, getEvaluators, getRelationships,
  (conditions, evaluators, relationships) => relationshipWithoutSelf(relationships).filter((relationship) => {
    const condition = _.find(conditions, { relationshipId: relationship.id })

    if (!condition || !evaluators) { return true }

    if (condition.comparator === 'atleast') { return true }

    return condition.comparator !== 'atleast' && condition.value && evaluators.length >= +condition.value
  }),
)
