import { connect } from 'react-redux'
import _ from 'lodash'

const mapStateToProps = state => ({
  options: _.get(state, ['campaigns', 'campaign', 'options', 'participants']),
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)
