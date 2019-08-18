import { connect } from 'react-redux'
import {
  logout,
  changeLocale,
} from 'user/core/temp/currentUser'

const mapStateToProps = state => ({
  logo: state.threeSixtyCampaign.temp.project.logo,
  isFrame: state.extras.isFrame,
})

const mapDispatchToProps = {
  logout,
  changeLocale,
}

export default connect(mapStateToProps, mapDispatchToProps)
