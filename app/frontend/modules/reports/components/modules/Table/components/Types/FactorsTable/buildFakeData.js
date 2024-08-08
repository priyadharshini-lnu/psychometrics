import { createSelector } from 'reselect'
import _ from 'lodash'

const buildFakeData = createSelector(
  ({ filters }) => filters,
  ({ milestones }) => milestones,
  ({ precision }) => precision,
  (filters, milestones, precision) => {
    const enhancedFilters = filters.map((filter) => {
      const { min, max } = _.sample(milestones?.length ? milestones : [{ min: 0, max: 5 }])
      return { ...filter, value: _.round(_.random(parseFloat(min), parseFloat(max), true), precision) }
    })
    return _.sortBy(enhancedFilters, 'value')
  },
)

export default buildFakeData
