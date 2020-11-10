import { connect } from 'react-redux'

const mapStateToProps = state => ({
  options: state.campaigns.campaign.options.participants,
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)
