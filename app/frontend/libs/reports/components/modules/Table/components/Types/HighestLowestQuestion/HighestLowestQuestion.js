import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import Utils from 'rb/utils'
import Text from '../../Table/CellTypes/Text/Text'
import styles from './HighestLowestQuestion.scss'

const QUESTIONS = {
  309: { props: { questionText: 'Test text1' } },
  310: { props: { questionText: 'Test text2' } },
  312: { props: { questionText: 'Test text3' } },
  313: { props: { questionText: 'Test text4' } },
  331: { props: { questionText: 'Test text5' } },
  332: { props: { questionText: 'Test text6' } },
  334: { props: { questionText: 'Test text7' } },
}

const MockData = {
  1: {
    name: 'Rubyable',
    questions: {
      309: 4, 310: 3.6666666666666665, 312: 1, 313: 4,
    },
  },
  2: {
    name: 'Reactable',
    questions: {
      309: 2.3333333333333335, 310: 2.3333333333333335, 312: 5, 313: 3,
    },
  },
  3: { name: 'railsability', questions: { 309: 1.3333333333333333, 310: 1.3333333333333333 } },
  4: { name: 'simple_ruby', questions: { 309: 2.3333333333333335, 310: 1 } },
  5: {
    name: 'jRuby',
    questions: {
      309: 1.3333333333333333, 310: 1.3333333333333333, 312: 1, 313: 1.3333333333333333, 331: 0, 332: 1.5, 334: 0,
    },
  },
  6: {
    name: 'redux',
    questions: {
      309: 1.3333333333333333, 310: 1.3333333333333333, 312: 1, 313: 1.3333333333333333, 331: 0, 332: 3.5,
    },
  },
  7: {
    name: 'flux',
    questions: {
      309: 1.3333333333333333, 310: 1, 312: 1, 313: 5, 331: 0, 334: 0,
    },
  },
}

class HighestLowestQuestion extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    let data
    const { module } = this.props
    if (ResultStore.realResults) {
      data = ResultStore.results[module.assessment_id].questionScoring
    } else {
      data = MockData
    }
    const tmp = []
    _.each(data, (factor) => {
      _.each(factor.questions, (q, id) => {
        tmp.push({ questionMean: Utils.round(q, 2), question_id: id, name: factor.name })
      })
    })

    const sorted = _.sortBy(tmp, d => -d.questionMean)
    const top = _.take(sorted, 5)
    const bottom = _.takeRight(sorted, 5)
    this.topData = top
    this.bottomData = bottom
  }

  render () {
    this.prepareRows()
    const { module } = this.props
    const assessmentId = module.assessment_id
    const questions = ResultStore.realResults ? AssessmentStore.questions[assessmentId] : QUESTIONS
    return (
      <div className={styles.table}>
        <table>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={4}>{I18nStore.t('reports.modules.highest_lowest.top_5')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.sub_competenties')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.item')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.mean_score')}</td>
            </tr>
            {_.map(this.topData, (data, i) => {
              const question = questions[data.question_id]
              return (
                <tr key={i}>
                  <Text model={{ text: i + 1 }} />
                  <Text model={{ text: data.name }} />
                  <td>{_.result(question, 'props.questionText')}</td>
                  <Text model={{ value: data.questionMean }} />
                </tr>
              )
            })}
          </tbody>
        </table>
        <table className={styles.bottom}>
          <tbody>
            <tr>
              <td className={styles.label} colSpan={4}>{I18nStore.t('reports.modules.highest_lowest.bottom_5')}</td>
            </tr>
            <tr>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.rank')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.sub_competenties')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.item')}</td>
              <td className={styles.label}>{I18nStore.t('reports.modules.highest_lowest.mean_score')}</td>
            </tr>
            {_.map(this.bottomData, (data, i) => {
              const question = questions[data.question_id]
              return (
                <tr key={i}>
                  <Text model={{ text: 5 - i }} />
                  <Text model={{ text: data.name }} />
                  <td>{_.result(question, 'props.questionText')}</td>
                  <Text model={{ value: data.questionMean }} />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default HighestLowestQuestion
