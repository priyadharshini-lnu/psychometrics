import { connect } from 'react-redux'

import {
  add as addAvailiblityCondition,
  update as updateAvailiblityCondition,
  remove as removeAvailiblityCondition,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
} from 'modules/admin/core/threeSixtyCampaign/reportOptions/availabilityConditions'

import { getAvailabilityConditions } from 'modules/admin/core/threeSixtyCampaign/reportOptions/selectors'
import { getRelationships } from 'modules/admin/core/threeSixtyCampaign/relationships'

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
