import { connect } from 'react-redux'
import {
  fetchNomination,
  removeNomination,
  addNomination,
  updateForm,
  updateStatus,
  showForm,
  hideForm,
  requestApproval,
  sendEvaluatorReminder,
  updateAllNominationStatus,
  updateNomination,
} from 'user/core/ThreesixtyCampaign/nomination'
import { searchEvaluators } from 'user/core/temp/autocomplete'
import {
  requirementsSelector,
  allowedRelationshipsForNewNominations,
} from 'user/core/ThreesixtyCampaign/nomination/selectors'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  instructions: state.threeSixtyCampaign.nomination.instructions,
  requirements: requirementsSelector(state.threeSixtyCampaign),
  autocomplete: state.threeSixtyCampaign.temp.autocomplete,
  allowedRelationshipsForNewNominations: allowedRelationshipsForNewNominations(state.threeSixtyCampaign),
})

const mapDispatchToProps = {
  fetchNomination,
  removeNomination,
  addNomination,
  searchEvaluators,
  updateForm,
  updateStatus,
  showForm,
  hideForm,
  requestApproval,
  sendEvaluatorReminder,
  updateAllNominationStatus,
  updateNomination,
}

export default connect(mapStateToProps, mapDispatchToProps)
