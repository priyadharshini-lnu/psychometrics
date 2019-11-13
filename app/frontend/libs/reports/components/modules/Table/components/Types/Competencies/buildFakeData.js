import { createSelector } from 'reselect'
import _ from 'lodash'

const buildFakeData = createSelector(
  ({ filters }) => filters,
  ({ milestones }) => milestones,
  (filters, milestones) => {
    const enhancedFilters = filters.map((filter) => {
      const { min, max } = _.sample(milestones)
      return { ...filter, value: _.round(_.random(parseFloat(min), parseFloat(max), true), 2) }
    })
    return _.sortBy(enhancedFilters, 'value')
  },
)

export default buildFakeData
