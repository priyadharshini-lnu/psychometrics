import { connect } from 'react-redux'
import {
  fetchNomination,
  removeNomination,
  addNomination,
  updateForm,
  updateStatus,
} from 'user/core/ThreesixtyCampaign/nomination'
import { searchEvaluators } from 'user/core/temp/autocomplete'
import { rowDataSelector } from 'user/core/ThreesixtyCampaign/nomination/selectors'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  rowData: rowDataSelector(state.threeSixtyCampaign),
  autocomplete: state.threeSixtyCampaign.temp.autocomplete,
})

const mapDispatchToProps = {
  fetchNomination,
  removeNomination,
  addNomination,
  searchEvaluators,
  updateForm,
  updateStatus,
}

export default connect(mapStateToProps, mapDispatchToProps)
