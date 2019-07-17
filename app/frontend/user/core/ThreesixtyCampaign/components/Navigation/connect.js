import { connect } from 'react-redux'
import { changeLocale } from 'user/core/temp/currentUser'

const mapDispatchToProps = {
  changeLocale,
}

export default connect(() => ({}), mapDispatchToProps)
