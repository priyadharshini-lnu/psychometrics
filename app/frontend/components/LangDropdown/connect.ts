import { connect } from 'react-redux'
import {
  changeLocale,
} from '~/core/currentUser'

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  onChange: changeLocale,
}

export default connect(mapStateToProps, mapDispatchToProps)
