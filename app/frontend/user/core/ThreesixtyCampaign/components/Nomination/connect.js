import { connect } from 'react-redux'
import {
  fetchNomination,
  removeNomination,
  addNomination,
  updateForm,
} from 'user/core/ThreesixtyCampaign/nomination'
import { searchEvaluators } from 'user/core/temp/autocomplete'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  autocomplete: state.threeSixtyCampaign.temp.autocomplete,
})

const mapDispatchToProps = {
  fetchNomination,
  removeNomination,
  addNomination,
  searchEvaluators,
  updateForm,
}

export default connect(mapStateToProps, mapDispatchToProps)
