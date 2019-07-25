import { connect } from 'react-redux'
import {
  logout,
  changeLocale,
} from 'user/core/temp/currentUser'

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  logout,
  changeLocale,
}

export default connect(mapStateToProps, mapDispatchToProps)
