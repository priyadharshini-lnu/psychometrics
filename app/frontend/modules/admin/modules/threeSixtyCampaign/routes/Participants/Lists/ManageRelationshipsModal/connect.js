import { connect } from 'react-redux'
import { fetchAllByUserId as fetchParticipants } from '~/modules/admin/modules/threeSixtyCampaign/core/participants'
import { closeModal, getCurrent } from '~/modules/admin/core/ui/modals'
import {
  fetchWithUsage, create, remove, update, getRelationships,
} from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'

export default connect(
  state => ({
    relationships: getRelationships(state),
    current: getCurrent(state),
  }),
  {
    fetchParticipants, fetchWithUsage, closeModal, create, remove, update,
  },
)
