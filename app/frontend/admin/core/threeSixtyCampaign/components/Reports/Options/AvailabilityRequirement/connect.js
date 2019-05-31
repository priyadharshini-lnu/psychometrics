import { connect } from 'react-redux'
import {
  addAvailiblityCondition,
  removeAvailiblityCondition,
  updateAvailiblityCondition,
  addNewLogicSetCondition,
  moveConditionToNextLogicSet,
} from 'admin/core/threeSixtyCampaign/reportOptions/actions'
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
    addNewLogicSetCondition,
    moveConditionToNextLogicSet,
  },
)
