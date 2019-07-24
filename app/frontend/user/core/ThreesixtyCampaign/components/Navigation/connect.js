import { connect } from 'react-redux'
import {
  logout,
} from 'user/core/temp/currentUser'

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  logout,
}

export default connect(mapStateToProps, mapDispatchToProps)
