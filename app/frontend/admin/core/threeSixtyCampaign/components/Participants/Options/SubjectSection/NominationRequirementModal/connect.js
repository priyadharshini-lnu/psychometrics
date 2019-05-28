import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'

export default connect(({
    threeSixtyCampaign: { nominationRequirements },
    temp: { modals: { current } },
  }) => ({
    nominationRequirements,
    currentModal: current,
  }),
  {
    closeModal
  },
)
