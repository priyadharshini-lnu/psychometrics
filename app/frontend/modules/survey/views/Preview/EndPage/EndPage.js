import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './EndPage.scss'

export class EndPage extends Component {
  static propTypes = {
    flowElement: PropTypes.object,
  }

  addLtrStyleIfNeed (phrase) {
    return phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {}
  }

  renderUniqueId () {
    const { flowElement, dbResult } = this.props
    if (flowElement && flowElement.type === 'EndOfAssessment') {
      if (flowElement.props.showUniqueId) {
        return (
          <div className={styles.end}>
            Your unique ID:
            {_.result(dbResult, 'hash_id', '<it is builder>')}
          </div>
        )
      }
    }
    return null
  }

  render () {
    const {
      flowElement, dashboardUrl, isAnonymousAssessment, I18n,
    } = this.props
    let message = I18n.t('assessments.messages.finish')

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
        {!isAnonymousAssessment && (
          <div className={styles.end}>
            <a href={dashboardUrl}>{I18n.t('assessments.actions.goto_dashboard')}</a>
          </div>
        )}
        {this.renderUniqueId()}
      </div>
    )
  }
}

export default EndPage
