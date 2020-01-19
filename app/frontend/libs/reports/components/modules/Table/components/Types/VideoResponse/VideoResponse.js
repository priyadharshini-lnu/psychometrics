/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react'
import _ from 'lodash'
import cs from 'classnames'
import ResultStore from 'rb/store/ResultStore'
import userPresenter from 'rb/presenters/userPresenter'
import I18nStore from 'rb/store/I18nStore'
import styles from './styles.scss'

const MOCK_RESULTS = [
  {
    id: 1,
    fullName: 'Casper Hammer',
    relationship: 'Manager',
  },
  {
    id: 2,
    fullName: 'Namrata Budhraja',
    relationship: 'Peer',
  },
  {
    id: 3,
    fullName: 'Franz Joseph Basco',
    relationship: 'Direct Report',
  },
  {
    id: 4,
    fullName: 'Gianne Arroz',
    relationship: 'Direct Report',
  },
]

const Evaluator = ({ evaluator }) => (
  <div className={styles.evaluator}>
    <div className="text-align-c">
      <a
        href={evaluator.video}
        className={styles.videoBox}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="glyphicon glyphicon-play-circle" aria-hidden="true" />
      </a>
    </div>
    <div className={styles.fullName}>
      <strong>{evaluator.fullName}</strong>
    </div>
    <div className={styles.relationship}>{evaluator.relationship}</div>
  </div>
)

export default class VideoResponse extends Component {
  getResults () {
    const { model } = this.props
    if (!ResultStore.realResults) return MOCK_RESULTS

    const rawResults = _.uniqBy(
      _.flatMap(model.props.filter, filterId => _.get(
        ResultStore, ['results', model.assessment_id, 'resultsByFilter', filterId, 'rawResults'], [],
      )),
      'id',
    )

    return rawResults.map(({
      user, id, relationship, answers,
    }) => ({
      relationship,
      id,
      fullName: userPresenter.getFullName({ firstName: user.first_name, lastName: user.last_name }),
      video: _.get(answers, [model.props.questionId, 'answers', 0, 'value']),
    })).filter(x => x.video)
  }

  renderNoResults () {
    return (
      <div className={styles.noResults}>
        <span className={cs('glyphicon glyphicon-play-circle', styles.icon)} aria-hidden="true" />
        <span className={styles.text}>{I18nStore.t('reports.modules.video_response.no_results')}</span>
      </div>
    )
  }

  render () {
    const results = this.getResults()
    if (!results.length) {
      return this.renderNoResults()
    }
    return (
      <div className={styles.container}>
        {results.map(evaluator => (
          <Evaluator key={evaluator.id} evaluator={evaluator} />
        ))}
      </div>
    )
  }
}
