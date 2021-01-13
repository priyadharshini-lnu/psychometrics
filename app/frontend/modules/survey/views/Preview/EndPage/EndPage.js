import _ from 'lodash'
import React, { Component } from 'react'
import { Table } from 'antd'
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

  renderScoring () {
    const { scoring, factors, dashboardUrl } = this.props
    if (!scoring) { return null }
    const data = _.map(scoring, (s, id) => ({
      id, competency: _.find(factors, { id: +id }).name, score: s.score,
    }))

    return (
      <div>
        <Table
          columns={[{
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
          }, {
            title: 'Competency',
            dataIndex: 'competency',
            key: 'competency',
          }, {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
          }]}
          dataSource={data}
          pagination={false}
        />
        <div className={styles.links}>
          <a href="?edit=true">{I18n.t('assessments.actions.re_evaluate')}</a>
          {' | '}
          <a href={dashboardUrl}>{I18n.t('assessments.actions.back_to_campaign')}</a>
        </div>
      </div>
    )
  }

  render () {
    const {
      flowElement, dashboardUrl, isAnonymousAssessment, I18n, isAssessor,
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
        {isAssessor && this.renderScoring()}
        {!isAssessor && !isAnonymousAssessment && (
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
