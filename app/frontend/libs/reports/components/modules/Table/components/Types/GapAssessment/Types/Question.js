import React from 'react'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import Utils from 'rb/utils'
import I18nStore from 'rb/store/I18nStore'
import styles from '../styles.scss'

const MOCK_POSITIVE_ROWS = [
  {
    factorName: 'Customer First',
    questionName: 'Rallies, aligns and inspires',
    left: 5.0,
    right: 3.83,
    diff: 1.17,
  },
  {
    factorName: 'Leads Transformation',
    questionName: 'Demonstrates organisational resilience',
    left: 4.83,
    right: 3.53,
    diff: 1.3,
  },
  {
    factorName: 'Greater Together',
    questionName: 'Creates strategic business partnerships',
    left: 4.83,
    right: 3.73,
    diff: 1.1,
  },
  {
    factorName: 'Game Changer',
    questionName: 'Fosters a change mindset',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
  },
  {
    factorName: 'Game Changer (1)',
    questionName: 'Cascades organisational',
    left: 4.83,
    right: 3.78,
    diff: 1.05,
  },
]
const MOCK_NEGATIVE_ROWS = []

// TODO (atanych): I have copied and pasted from another file. Have to sort out when integrate real results
export default function Question ({ filters: [left, right], filters, model }) {
  const getResults = () => {
    if (!ResultStore.realResults) return [MOCK_POSITIVE_ROWS, MOCK_NEGATIVE_ROWS]

    const questionScoringLeft = _.get(ResultStore, [
      'results',
      model.assessment_id,
      'resultsByFilter',
      left.id,
      'questionScoring',
    ])
    const questionScoringRight = _.get(ResultStore, [
      'results',
      model.assessment_id,
      'resultsByFilter',
      right.id,
      'questionScoring',
    ])

    if (!questionScoringLeft || !questionScoringRight) return [[], []]

    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const dimensionId = assessment && assessment.dimensionId
    const factorMap = _.keyBy(AppStore.factors[dimensionId], f => f.id)
    const questionMap = AssessmentStore.questions[model.assessment_id]

    let results = _.flatMap(questionScoringLeft,
      (questionResults, factorId) => _.map(questionResults, (res, questionId) => {
        const leftMean = _.meanBy(res, r => r.getValue())
        const rightMean = _.meanBy(questionScoringRight[factorId][questionId], r => r.getValue())
        const row = { left: _.round(leftMean, 2), right: _.round(rightMean, 2) }
        return {
          ...row,
          factorName: I18nStore.tFactor(factorMap[factorId], 'name'),
          questionName: Utils.stripHTML(_.get(questionMap[questionId], 'props.questionText')),
          factor: factorMap[factorId],
          diff: row.left - row.right,
        }
      }))
    results = _.sortBy(results, d => -d.diff)
    const positive = _.take(_.takeWhile(results, d => d.diff > 0), 5)
    const negative = _.take(_.takeRightWhile(results, d => d.diff < 0), 5)
    return [positive, negative]
  }

  const [positive, negative] = getResults()
  return (
    <div className={styles.table}>
      <Table
        title={I18nStore.t('reports.modules.gap_assessment.positive_gap')}
        emptyText={I18nStore.t('reports.modules.gap_assessment.no_positive_gaps')}
        filters={filters}
        rows={positive}
      />
      <Table
        title={I18nStore.t('reports.modules.gap_assessment.negative_gap')}
        emptyText={I18nStore.t('reports.modules.gap_assessment.no_negative_gaps')}
        filters={filters}
        rows={negative}
      />
    </div>
  )
}

function Table ({
  filters: [left, right], title, rows, emptyText,
}) {
  return (
    <table>
      <thead>
        <tr>
          <td className={styles.label} colSpan={6}>
            {title}
          </td>
        </tr>
        <tr>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.rank')}</td>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.scoring_category')}</td>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.item')}</td>
          <td className={styles.label}>{I18nStore.tFilterName(left)}</td>
          <td className={styles.label}>{I18nStore.tFilterName(right)}</td>
          <td className={styles.label}>{I18nStore.t('reports.modules.gap_assessment.gap')}</td>
        </tr>
      </thead>
      <TBody rows={rows} emptyText={emptyText} />
    </table>
  )
}

function TBody ({ rows, emptyText }) {
  if (!rows.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={6}>{emptyText}</td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {_.map(rows, (row, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{row.factorName}</td>
          <td>{row.questionName}</td>
          <td>{row.left}</td>
          <td>{row.right}</td>
          <td>{row.diff}</td>
        </tr>
      ))}
    </tbody>
  )
}
