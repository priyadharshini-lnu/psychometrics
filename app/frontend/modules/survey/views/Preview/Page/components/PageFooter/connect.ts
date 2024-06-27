import { connect } from 'react-redux'
import _ from 'lodash'
import { saveCurrentPage } from '~/modules/survey/core/preview/FlowProcessor/actions'

const mapStateToProps = state => ({
  options: _.get(state, ['campaigns', 'campaign', 'options', 'participants']),
  invalidSession: state.preview.invalidSession,
})

const mapDispatchToProps = {
  saveCurrentPage,
}

export default connect(mapStateToProps, mapDispatchToProps)
