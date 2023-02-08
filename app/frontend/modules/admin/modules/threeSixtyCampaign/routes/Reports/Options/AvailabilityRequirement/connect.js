import { connect } from 'react-redux'

import {
  add as addAvailiblityCondition,
  update as updateAvailiblityCondition,
  remove as removeAvailiblityCondition,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
} from '~/modules/admin/modules/threeSixtyCampaign/core/reportOptions/availabilityConditions'

import { getAvailabilityConditions } from '~/modules/admin/modules/threeSixtyCampaign/core/reportOptions/selectors'
import { getRelationships } from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'

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
