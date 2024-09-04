import { connect } from 'react-redux'
import { fetchAllByUserId as fetchParticipants } from '~/modules/admin/modules/threeSixtyCampaign/core/participants'
import { closeModal, getCurrent, getData } from '~/modules/admin/core/ui/modals'
import { fetchRelationships } from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'

export default connect(
  state => ({
    ...getData(state).ParticipantModal,
    current: getCurrent(state),
    permissions: state.threeSixtyCampaign.subjects.permissions,
  }),
  { fetchParticipants, fetchRelationships, closeModal },
)
