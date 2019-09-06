import { connect } from 'react-redux'

import {
  add as addAvailiblityCondition,
  update as updateAvailiblityCondition,
  remove as removeAvailiblityCondition,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
} from 'admin/core/threeSixtyCampaign/reportOptions/availabilityConditions'

import { getAvailabilityConditions } from 'admin/core/threeSixtyCampaign/reportOptions/selectors'
import { getRelationships } from 'admin/core/threeSixtyCampaign/relationships'

export default connect(
  state => ({
    conditions: getAvailabilityConditions(state),
    relationships: getRelationships(state),
  }),
  {
    addAvailiblityCondition,
    removeAvailiblityCondition,
    updateAvailiblityCondition,
    addNewLogicalSetCondition,
    moveConditionToNextLogicSet,
  },
)
