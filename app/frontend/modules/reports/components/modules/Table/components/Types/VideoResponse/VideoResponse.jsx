import { Component } from 'react'
import _ from 'lodash'
import { PlayCircleOutlined } from '@ant-design/icons'
import ResultStore from '~/modules/reports/store/ResultStore'
import userPresenter from '~/modules/reports/presenters/userPresenter'
import I18nStore from '~/modules/reports/store/I18nStore'
import styles from './styles.less'

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
  <a
    href={evaluator?.video?.url}
    className={styles.evaluator}
    target="_blank"
    rel="noopener noreferrer"
  >
    <div className="text-align-l">
      <PlayCircleOutlined className={styles.icon} />
    </div>
    <div className={styles.fullName}>
      <strong>{evaluator.fullName}</strong>
    </div>
    <div className={styles.relationship}>{evaluator.relationship}</div>
  </a>
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
      user, id, relationship, media_responses: media,
    }) => ({
      relationship,
      id,
      fullName: userPresenter.getFullName({ firstName: user.first_name, lastName: user.last_name }),
      video: _(media)
        .filter(m => m.question_id === model.props.questionId && m.url)
        .sortBy('user_selected').last(),
    })).filter(x => x.video)
  }

  renderNoResults () {
    return (
      <div className={styles.noResults}>
        <PlayCircleOutlined className={styles.icon} />
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
