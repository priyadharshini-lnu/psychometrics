import { connect } from 'react-redux'
import { getSupportedDataConfiguration } from 'modules/reports/core/builder'

const mapStateToProps = state => ({
  dataConfiguration: getSupportedDataConfiguration(state),
})


export default connect(mapStateToProps, {})
