import { connect } from 'react-redux'
import {
  add,
  remove,
  update,
} from 'admin/core/threeSixtyCampaign/nominationRequirements/conditions'

export default connect(({
  project: { relationships },
  threeSixtyCampaign: { nominationRequirements: { list, selectedIndex } },
}) => ({
  conditions: list[selectedIndex].conditions,
  relationships,
}),
{
  add,
  remove,
  update,
})
