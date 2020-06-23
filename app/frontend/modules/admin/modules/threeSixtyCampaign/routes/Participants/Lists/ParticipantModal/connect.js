import { connect } from 'react-redux'
import { fetchAllByUserId as fetchParticipants } from 'modules/admin/modules/threeSixtyCampaign/core/participants'
import { closeModal } from 'modules/admin/core/temp/modals'
import { fetchRelationships } from 'modules/admin/modules/threeSixtyCampaign/core/relationships'

export default connect(
  ({
    temp: {
      modals: { data, current },
    },
  }) => ({ ...data.ParticipantModal, current }),
  { fetchParticipants, fetchRelationships, closeModal },
)
