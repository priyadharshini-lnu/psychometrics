import { connect } from 'react-redux'
import {
  changeLocale,
} from 'core/currentUser'

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  changeLocale,
}

export default connect(mapStateToProps, mapDispatchToProps)
