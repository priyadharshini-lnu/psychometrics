import React, { Component } from 'react'
import AppStore from 'store/AppStore'
import ScoringList from 'views/ScoringList'
import { SCORING } from 'constants/scoring'
import Socket from 'cable'
import styles from './Scoring.scss'
import Header from './Header'

export default class Scoring extends Component {
  state = {
    type: SCORING,
  }

  componentDidMount () {
    Socket.setProvider('Assessment')
    this.appListener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.appListener.remove()
  }

  updateType = type => this.setState({ type })

  loading () {
    return (
      <div className={styles.loading}>
        <i className={`fa fa-refresh fa-spin fa-fw ${styles.icon}`} />
        <span className={styles.loadingLabel}>Saving...</span>
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
