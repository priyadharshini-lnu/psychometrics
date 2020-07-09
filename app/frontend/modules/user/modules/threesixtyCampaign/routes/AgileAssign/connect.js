import { connect } from 'react-redux'

const mapStateToProps = state => ({ ...state.extras })

export default connect(mapStateToProps, null)
