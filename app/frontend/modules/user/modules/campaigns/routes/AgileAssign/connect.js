import { connect } from 'react-redux'
import { get as getConfig } from 'modules/user/core/config'

const mapStateToProps = state => getConfig(state)

export default connect(mapStateToProps, null)
