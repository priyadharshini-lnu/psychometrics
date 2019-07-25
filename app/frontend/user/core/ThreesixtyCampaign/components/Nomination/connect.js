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
} from 'user/core/ThreesixtyCampaign/nomination'
import { searchEvaluators } from 'user/core/temp/autocomplete'
import { requirementsSelector } from 'user/core/ThreesixtyCampaign/nomination/selectors'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  instructions: state.threeSixtyCampaign.nomination.instructions,
  requirements: requirementsSelector(state.threeSixtyCampaign),
  autocomplete: state.threeSixtyCampaign.temp.autocomplete,
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
}

export default connect(mapStateToProps, mapDispatchToProps)
