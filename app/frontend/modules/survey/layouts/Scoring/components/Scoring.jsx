import { Component } from 'react'
import ScoringList from '~/modules/survey/views/ScoringList'
import { SCORING } from '~/modules/survey/constants/scoring'
import styles from './Scoring.less'
import Header from './Header'

export default class Scoring extends Component {
  state = {
    type: SCORING,
  }

  componentDidMount () {
    const { subscribeSocket, socketInitialized } = this.props
    if (!socketInitialized) {
      const urldata = location.pathname.match(/assessments\/(\d+)/)
      const id = urldata && urldata[1]
      subscribeSocket('Assessments::Channel', { assessment_id: id })
    }
  }

  updateType = type => this.setState({ type })

  loading () {
    return (
      <div className={styles.loading}>
        <i className={`fa fa-refresh fa-spin fa-fw ${styles.icon}`} />
        <span className={styles.loadingLabel}>Loading...</span>
      </div>
    )
  }

  render () {
    const { type } = this.state
    const { loaded } = this.props

    return (
      <div className="col-md-12">
        <div className="panel panel-default">
          <Header updateType={this.updateType} type={type} {...this.props} />
          <div className={`panel-body ${styles.mainContainer}`}>
            {!loaded && this.loading()}
            <ScoringList type={type} />
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}
