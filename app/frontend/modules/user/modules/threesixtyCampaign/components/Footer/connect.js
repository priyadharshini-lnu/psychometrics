import { connect } from 'react-redux'
import {
  getPrivacyText, privacyPageLink, getSecondaryLogo, getName,
} from 'modules/user/modules/threesixtyCampaign/core/project'
import { get as getConfig } from 'modules/user/core/config'

const mapStateToProps = state => ({
  isFrame: getConfig(state).isFrame,
  privacyText: getPrivacyText(state),
  privacyPageLink: privacyPageLink(state),
  secondaryLogo: getSecondaryLogo(state),
  projectName: getName(state),
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
