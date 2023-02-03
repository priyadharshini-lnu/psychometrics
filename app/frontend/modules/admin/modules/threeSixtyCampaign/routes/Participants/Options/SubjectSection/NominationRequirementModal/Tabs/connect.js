import { connect } from 'react-redux'
import {
  add as addNominationRequirement,
  moveDown,
  moveUp,
  remove,
  rename,
  copy,
  changeSelectedIndex,
} from '~/modules/admin/modules/threeSixtyCampaign/core/nominationRequirements/actions'
import {
  get as getNominationRequirements,
} from '~/modules/admin/modules/threeSixtyCampaign/core/nominationRequirements/selectors'
import { getCurrent } from '~/modules/admin/core/ui/modals'

export default connect(state => ({
  currentModal: getCurrent(state),
  nominationRequirements: getNominationRequirements(state),
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
