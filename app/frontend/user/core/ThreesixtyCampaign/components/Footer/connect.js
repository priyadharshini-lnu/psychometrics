import { connect } from 'react-redux'
import { getPrivacyText, privacyPageLink } from 'user/core/temp/project'

const mapStateToProps = state => ({
  isFrame: state.extras.isFrame,
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
