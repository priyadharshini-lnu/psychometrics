import { connect } from 'react-redux'
import {
  getPrivacyText, privacyPageLink, getLogo, getName,
} from 'modules/user/modules/campaigns/core/project'
import { get as getConfig } from 'modules/user/core/config'

const mapStateToProps = state => ({
  isFrame: getConfig(state).isFrame,
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
  projectLogo: getLogo(state),
  projectName: getName(state),
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
