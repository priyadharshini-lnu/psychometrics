import _ from 'lodash'
import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  add as addNominationRequirement,
} from 'admin/core/threeSixtyCampaign/nominationRequirements/index.js'

export default connect(({
    temp: { modals: { current } },
    threeSixtyCampaign: { nominationRequirements: { list } },
  }) => ({
    currentModal: current,
    nominationsPresent: !_.isEmpty(list)
  }),
  {
    closeModal,
    addNominationRequirement
  },
)
