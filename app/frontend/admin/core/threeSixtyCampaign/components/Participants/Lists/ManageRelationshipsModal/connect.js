import { connect } from 'react-redux'
import { fetchAllByUserId as fetchParticipants } from 'admin/core/threeSixtyCampaign/participants'
import { closeModal } from 'admin/core/temp/modals'
import { fetchWithUsage, create, remove, update } from 'admin/core/threeSixtyCampaign/relationships'

export default connect(
  ({
    project: { relationships },
    temp: {
      modals: { current },
    },
  }) => ({ relationships, current }),
  { fetchParticipants, fetchWithUsage, closeModal, create, remove, update },
)
