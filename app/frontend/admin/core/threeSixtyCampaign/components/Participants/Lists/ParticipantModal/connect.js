import { connect } from 'react-redux'
import { fetchAllByUserId as fetchParticipants } from 'admin/core/threeSixtyCampaign/participants'
import { closeModal } from 'admin/core/temp/modals'
import { fetchRelationships } from 'admin/core/threeSixtyCampaign/relationships'

export default connect(
  ({ temp: { modals: { data, current } } }) => ({ user: data, current }),
  { fetchParticipants, fetchRelationships, closeModal },
)
