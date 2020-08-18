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
} from 'modules/user/modules/campaigns/core/nomination'
import { get as getAutocomplete, searchEvaluators } from 'modules/user/core/ui/autocomplete'
import {
  requirementsSelector,
  allowedRelationshipsForNewNominations,
} from 'modules/user/modules/campaigns/core/nomination/selectors'

const mapStateToProps = state => ({
  nomination: state.campaigns.nomination,
  instructions: state.campaigns.nomination.instructions,
  requirements: requirementsSelector(state.campaigns),
  autocomplete: getAutocomplete(state),
  allowedRelationshipsForNewNominations: allowedRelationshipsForNewNominations(state.campaigns),
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
}

export default connect(mapStateToProps, mapDispatchToProps)
