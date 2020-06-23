import { connect } from 'react-redux'
import {
  add as addNominationRequirement,
  moveDown,
  moveUp,
  remove,
  rename,
  copy,
  changeSelectedIndex,
} from 'modules/admin/modules/threeSixtyCampaign/core/nominationRequirements/actions'

export default connect(({
  threeSixtyCampaign: { nominationRequirements },
  temp: { modals: { current } },
}) => ({
  currentModal: current,
  nominationRequirements,
}),
{
  addNominationRequirement,
  moveDown,
  moveUp,
  remove,
  rename,
  copy,
  changeSelectedIndex,
})
