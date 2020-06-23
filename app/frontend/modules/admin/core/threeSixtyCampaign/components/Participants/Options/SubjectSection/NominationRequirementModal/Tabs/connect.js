import { connect } from 'react-redux'
import {
  add as addNominationRequirement,
  moveDown,
  moveUp,
  remove,
  rename,
  copy,
  changeSelectedIndex,
} from 'modules/admin/core/threeSixtyCampaign/nominationRequirements/actions'

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
