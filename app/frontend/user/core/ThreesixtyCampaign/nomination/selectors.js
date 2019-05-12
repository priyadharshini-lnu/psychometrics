import _ from 'lodash'
import { createSelector } from 'reselect'

export const getConditions = state => state.nomination.requirements.conditions
export const getEvaluators = state => state.nomination.evaluators
export const getRelationships = state => state.nomination.relationships

export const rowDataSelector = createSelector(
  getConditions, getEvaluators, getRelationships,
  (conditions, evaluators, relationships) => {
    const rows = []
    _.each(conditions, ({ id, value, predicate }) => {
      const { name } = _.find(relationships, { id })
      const count = (evaluators[name] && evaluators[name].length) || 0
      _.each(evaluators[name], (evaluator, i) => rows.push({
        rowSpan: i === 0 && count > 0 ? count + 1 : 0,
        title: i === 0 ? name : null,
        key: evaluator.id,
        condition: `${predicate} ${value}`,
        evaluator,
      }))
      rows.push({
        rowSpan: count > 0 ? 0 : 1,
        title: count > 0 ? null : name,
        name: `Add ${name}`,
        key: `${name}_link`,
        type: 'link',
        condition: `${predicate} ${value}`,
        relationship: id,
      })
    })
    return rows
  },
)
