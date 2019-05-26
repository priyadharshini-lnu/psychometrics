import { connect } from 'react-redux'
import {
  addAvailiblityCondition,
  removeAvailiblityCondition,
  updateAvailiblityCondition,
  addNewLogicSetCondition,
  moveConditionToNextLogicSet,
} from 'admin/core/threeSixtyCampaign/reportOptions/actions'
import { getAvailabilityConditions } from 'admin/core/threeSixtyCampaign/reportOptions/selectors'

export default connect(
  state => ({ conditions: getAvailabilityConditions(state) }),
  {
    addAvailiblityCondition,
    removeAvailiblityCondition,
    updateAvailiblityCondition,
    addNewLogicSetCondition,
    moveConditionToNextLogicSet,
  },
)
