import { connect } from 'react-redux'
import {
  add as addNominationRequirement,
  moveDown,
  moveUp,
  changeSelectedIndex
} from 'admin/core/threeSixtyCampaign/nominationRequirements/index.js'

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
    changeSelectedIndex
  },
)
