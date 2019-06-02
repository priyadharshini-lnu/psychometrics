import { connect } from 'react-redux'
import {
  add,
  remove,
  update,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
} from 'admin/core/threeSixtyCampaign/nominationRequirements/subjectConditions'

export default connect(({
  project: { datasheetFields },
  threeSixtyCampaign: { nominationRequirements: { list, selectedIndex } },
}) => ({
  subjectConditions: list[selectedIndex].subjectConditions,
  datasheetFields,
}),
{
  add,
  remove,
  update,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
})
