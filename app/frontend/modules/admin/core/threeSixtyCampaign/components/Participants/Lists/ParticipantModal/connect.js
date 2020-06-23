import { connect } from 'react-redux'
import { fetchAllByUserId as fetchParticipants } from 'modules/admin/core/threeSixtyCampaign/participants'
import { closeModal } from 'modules/admin/core/temp/modals'
import { fetchRelationships } from 'modules/admin/core/threeSixtyCampaign/relationships'

export default connect(
  ({
    temp: {
      modals: { data, current },
    },
  }) => ({ ...data.ParticipantModal, current }),
  { fetchParticipants, fetchRelationships, closeModal },
)
