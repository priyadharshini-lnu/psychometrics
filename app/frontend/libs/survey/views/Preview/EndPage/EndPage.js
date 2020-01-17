import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'store/AssessmentPreviewStore'
import styles from './EndPage.scss'

export class EndPage extends Component {
  static propTypes = {
    flowElement: PropTypes.object,
  }

  changeHidden = (e) => {
    store.hideHiddenQuestions = e.currentTarget.checked
    store.update()
    this.forceUpdate()
  }

  changeIgnore = (e) => {
    store.ignoreValidation = e.currentTarget.checked
    this.forceUpdate()
  }

  restart () {
    store.restart()
  }

  addLtrStyleIfNeed (phrase) {
    return phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {}
  }

  renderUniqueId () {
    const { flowElement } = this.props
    if (flowElement && flowElement.type === 'EndOfAssessment') {
      if (flowElement.props.showUniqueId) {
        return (
          <div className={styles.end}>
            Your unique ID:
            {_.result(store.dbResult, 'hash_id', '<it is builder>')}
          </div>
        )
      }
    }
    return null
  }

  render () {
    let message = 'We thank you for your time spent taking this survey.\nYour response has been recorded.'
    const { flowElement } = this.props
    if (flowElement && flowElement.type === 'EndOfAssessment') {
      if (flowElement.props.messageType === 'Custom') {
        // eslint-disable-next-line prefer-destructuring
        message = flowElement.props.message
      }
    }
    return (
      <div className={styles.page}>
        <div className={styles.logo}>
          {/* <img src={Logo} /> */}
        </div>
        <div className={styles.end} style={this.addLtrStyleIfNeed(message)}>
          {message}
        </div>
        {!store.isAnonymousAssessment && (
        <div className={styles.end}>
          <a href={store.dashboardUrl}>Go to dashboard</a>
        </div>
        )}
        {this.renderUniqueId()}
      </div>
    )
  }
}

export default EndPage
