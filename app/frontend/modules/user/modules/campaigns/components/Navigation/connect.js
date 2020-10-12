import { connect } from 'react-redux'
import {
  logout,
  changeLocale,
  get as getCurrentUser,
} from 'core/currentUser'
import { getLogo } from 'modules/user/modules/campaigns/core/project'
import { get as getConfig } from 'modules/user/core/config'

const mapStateToProps = state => ({
  logo: getLogo(state),
  isFrame: getConfig(state).isFrame,
  isAnonym: getCurrentUser(state).isAnonym,
})

const mapDispatchToProps = {
  logout,
  changeLocale,
}

export default connect(mapStateToProps, mapDispatchToProps)
