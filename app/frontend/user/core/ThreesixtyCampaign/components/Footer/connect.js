import { connect } from 'react-redux'

const mapStateToProps = state => ({
  isFrame: state.extras.isFrame,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
