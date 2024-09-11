/* eslint-disable max-len */
import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'

import ResultStore from '~/modules/reports/store/ResultStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import AppStore from '~/modules/reports/store/AppStore'
import { TopFactorType } from '~/modules/reports/models/Results/interfaces'
import BulletGraph from '~/modules/reports/components/BulletGraph'
import PieGraph from '~/modules/reports/components/PieGraph'
import buildFakeData from './buildFakeData'

import styles from './FactorsTable.less'

// Images
import Accountability from './Icons/accountability.svg'
import Achievement from './Icons/achievement.svg'
import Agility from './Icons/agility.svg'
import Ambiguity from './Icons/ambiguity.svg'
import Ambition from './Icons/ambition.svg'

const MockData = [
  {
    id: 469,
    icon: Ambiguity,
    name: 'Ambiguity',
    alias: 'Ambiguity',
    label: 'High',
    color: '#666666',
    meanNormScore: 65.8,
    strategy: 0,
    benchmarkScore: 70,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    strengths: `
* Lorem ipsum dolor sit amet consectetur
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    blindspots: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    workstyles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
  },
  {
    id: 470,
    icon: Achievement,
    name: 'Achievement',
    alias: 'Achievement',
    label: 'Medium',
    color: '#999999',
    meanNormScore: 35,
    benchmarkScore: 50,
    strategy: 1,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    strengths: `
* Lorem ipsum dolor sit amet
* Consectetur adipisicing elit
* Ipsum dolor sit amet
    `,
    blindspots: `
* Lorem ipsum dolor sit amet
* Consectetur adipisicing elit
    `,
    workstyles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
  },
  {
    id: 471,
    icon: Accountability,
    name: 'Accountability',
    alias: 'Accountability',
    label: 'Medium',
    color: '#999999',
    meanNormScore: 55,
    benchmarkScore: 45,
    strategy: 2,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    strengths: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    blindspots: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    workstyles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
  },
  {
    id: 472,
    icon: Ambition,
    name: 'Ambition',
    alias: 'Ambition',
    label: 'Low',
    color: '#aaaaaa',
    meanNormScore: 0.75,
    benchmarkScore: 2,
    strategy: 3,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    strengths: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    blindspots: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    workstyles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
  },
  {
    id: 473,
    icon: Agility,
    name: 'Agility',
    alias: 'Agility',
    label: 'High',
    color: '#666666',
    meanNormScore: 95,
    benchmarkScore: 80,
    strategy: 0,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    strengths: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    blindspots: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    workstyles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
  },
]

class FactorsTable extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  getMockData (factors, size) {
    const data = []
    while (data.length < size && size > 0) {
      const items = _.take(MockData, size - data.length)
      data.push(...items)
    }
    return data.map((factor, i) => ({
      ...factor,
      ...factors[i],
    }))
  }

  prepareRows () {
    const { module, module: { props } } = this.props
    const sourceFactors = _.get(props, ['source', 'factors'], [])
    const scoreRangeMin = _.get(props, ['scoreRangeMin'], -Infinity)
    const scoreRangeMax = _.get(props, ['scoreRangeMax'], Infinity)
    const factorIds = sourceFactors.map(f => f.id)
    if (ResultStore.realResults) {
      if (props.mode === 'topFactors') {
        this.factorsData = ResultStore.results[module.assessment_id].getTopFactors(
          props.minPosition, props.maxPosition, factorIds, TopFactorType.Any, scoreRangeMin, scoreRangeMax,
        )
      } else {
        const factorData = ResultStore.results[module.assessment_id].getTopFactors(0, factorIds.length, factorIds, TopFactorType.Any)
        this.factorsData = _.sortBy(factorData, f => factorIds.indexOf(f.id))
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (props.mode === 'topFactors') {
        this.factorsData = this.getMockData(sourceFactors, props.maxPosition - props.minPosition + 1)
      } else {
        this.factorsData = this.getMockData(sourceFactors, factorIds.length)
      }
    }
    if (props.reverseOrder && props.mode === 'topFactors') {
      this.factorsData.reverse()
    }
  }

  getFilters = () => {
    const { model } = this.props
    const filterIds = model.props.filter
    const filters = filterIds?.map(filterId => _.find(
      AppStore.report.filters, { id: filterId },
    )).filter(f => !_.isEmpty(f))

    return filters || []
  }


  enhanceFiltersByValue = (factor) => {
    const { model } = this.props
    const precision = model.props.precision ?? 2
    const filters = this.getFilters()
    if (!ResultStore.realResults) {
      const { milestones } = model.props
      return buildFakeData({ filters, milestones, precision })
    }

    const enhancedFilters = filters.map((filter) => {
      const scoring = _.get(ResultStore, [
        'results',
        model.assessment_id,
        'resultsByFilter',
        filter.id,
        'scoring',
        factor.id,
      ])

      if (!scoring) return { ...filter, value: 0 }
      const nonZeroResults = _.filter(scoring.results, res => res.getValue())
      const value = (_.round(_.meanBy(nonZeroResults, res => res.getValue()), precision))
      return { ...filter, value }
    })

    return enhancedFilters
  }

  canShowRank () {
    const { model: { props: { showRankOrder, mode } } } = this.props

    return (mode !== 'orderedFactors' && showRankOrder)
  }

  renderFactors () {
    const { model, module, assessments } = this.props
    const { fontFamily } = module.props.style
    const benchmarkScores = assessments[model.assessment_id]?.factor_benchmark_scores || []

    return (
      this.factorsData.map((factor, i) => {
        const conditions = _.filter(module.textConditions, { factorId: factor.id })
        let conditionTitle = null
        let conditionText = null
        let conditionStrengths = null
        let conditionBlindspots = null
        let conditionLabel = null
        let conditionColor = null
        let conditionBaselineScore = null
        const normedOrRawMeanScore = factor.meanNormScore || factor.meanRawScore
        if (ResultStore.realResults) {
          for (let i = 0; i < conditions.length; i += 1) {
            conditionTitle = _.invoke(conditions[i], 'getTextByCondition', normedOrRawMeanScore,
              _.indexOf(module.textConditions, conditions[i]), 'title')
            conditionText = _.invoke(conditions[i], 'getTextByCondition', normedOrRawMeanScore,
              _.indexOf(module.textConditions, conditions[i]), 'text')
            conditionStrengths = _.invoke(conditions[i], 'getTextByCondition', normedOrRawMeanScore,
              _.indexOf(module.textConditions, conditions[i]), 'strengths')
            conditionBlindspots = _.invoke(conditions[i], 'getTextByCondition', normedOrRawMeanScore,
              _.indexOf(module.textConditions, conditions[i]), 'blindspots')
            conditionLabel = _.invoke(conditions[i], 'getTextByCondition', normedOrRawMeanScore,
              _.indexOf(module.textConditions, conditions[i]), 'label')
            conditionColor = _.invoke(conditions[i], 'getColorByCondition', normedOrRawMeanScore)
            conditionBaselineScore = _.invoke(conditions[i], 'getValueByCondition', normedOrRawMeanScore, 'baselineScore')
            if (conditionTitle || conditionText || conditionStrengths
              || conditionBlindspots || conditionLabel || conditionColor
              || conditionBaselineScore) {
              break
            }
          }
        } else {
          conditionText = factor.description
          conditionStrengths = factor.strengths
          conditionBlindspots = factor.blindspots
          conditionLabel = factor.label
          conditionColor = factor.color
          conditionBaselineScore = 3.5
        }

        conditionTitle = conditionTitle ?? I18nStore.tFactorName(factor)
        conditionText = conditionText ?? I18nStore.tFactor(factor, 'description')
        conditionColor = conditionColor ?? '#666666'

        const {
          tableStyle = 'default', minPosition, maxPosition, reverseOrder, source: { factors },
          showDescription, showIcons, showStrengthsBlindspots, showScore, showName, showLabel,
          scoreProgressColor, scoreBackgroundColor, maxScoreValue, scorePosition = 'inline',
          scoreDisplay = 'circular', scoreRanges = [], scoreLineColor, scoreBulletColor, precision,
          showScoreText, scoreBulletGraphHeight, showBenchmarks,
        } = model.props

        const startRank = reverseOrder ? Math.max(1, factors.length - maxPosition + 1) : minPosition

        const score = _.round(normedOrRawMeanScore, 1)
        const maxValue = maxScoreValue ?? (factor.strategy === 3 ? 100 : 5)
        const percent = score * 100 / maxValue

        const filters = this.getFilters()
        const showWithFilters = (model.props.mode !== 'topFactors' && filters.length > 0)
        const resultsWithEnhancedWithFilters = this.enhanceFiltersByValue(factor)

        const scoreUI = (
          <>
            {showScore && (
              tableStyle === 'default' && scoreDisplay === 'circular' && (
              <PieGraph
                strokeWidth="10"
                text={_.isNil(precision) ? score : _.round(score, precision)}
                percent={Math.min(percent, 100)}
                progressColor={scoreProgressColor}
                backgroundColor={scoreBackgroundColor}
              />
              )
            )}
            {showScore && (
              tableStyle === 'default' && scoreDisplay === 'bullet' && (
              <BulletGraph
                scoreRanges={scoreRanges}
                baselineScore={conditionBaselineScore}
                scorePercentage={percent}
                lineColor={scoreLineColor}
                bulletColor={scoreBulletColor}
                showScoreText={showScoreText}
                score={score}
                scoreBulletGraphHeight={scoreBulletGraphHeight}
              />
              )
            )}
          </>
        )

        return (
          <tr key={i}>
            {this.canShowRank() && (
              <td className={styles.rankOrder}>
                <span className={tableStyle !== 'compact' ? cs(styles.star, 'icon-star') : ''}>
                  <span className={styles.text} style={{ fontFamily }}>{startRank + i}</span>
                </span>
              </td>
            )}
            {(showIcons || showName || showDescription || (showScore && scorePosition === 'block')) && (
              <td className={styles.description}>
                {showIcons && (
                  <div className={styles.icons}>
                    <img src={factor.icon} />
                  </div>
                )}
                {(showName || showDescription || showStrengthsBlindspots || (showScore && scorePosition === 'block')) && (
                  <div className={styles.content}>
                    {showName && (
                      <div className={styles.strength}>
                        {_.isEmpty(conditionTitle) ? I18nStore.tFactor(factor, 'alias') : conditionTitle}
                      </div>
                    )}
                    {scorePosition === 'block' && !showWithFilters ? scoreUI : null}
                    {showDescription && (
                      <ReactMarkdown className={cs(styles.text, 'mt4')}>
                        {conditionText}
                      </ReactMarkdown>
                    )}
                    {showStrengthsBlindspots && (
                      <div className={cs(styles.strengthsBlindspots, 'mt8')}>
                        <ReactMarkdown className={styles.strengths}>
                          {conditionStrengths}
                        </ReactMarkdown>
                        <ReactMarkdown className={styles.blindspots}>
                          {conditionBlindspots}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </td>
            )}
            {!showWithFilters && ((showScore && scorePosition === 'inline') || (showLabel && !showScore)) ? (
              <td className={cs({
                [styles.score]: showScore,
                [styles.circular]: scoreDisplay === 'circular',
                [styles.bullet]: scoreDisplay === 'bullet',
              })}
              >
                {scoreUI}
                {showScore && tableStyle === 'compact' && score}
                {!showScore && showLabel && (
                  <div className={styles.label} style={{ backgroundColor: conditionColor }}>{conditionLabel}</div>
                )}
              </td>
            ) : null}

            {showWithFilters && ((showScore) || (showLabel && !showScore)) ? (
              resultsWithEnhancedWithFilters.map((filter, i) => (
                <td
                  key={i}
                  className={cs(styles.score)}
                >
                  {filter.value.toFixed(precision)}
                </td>
              ))
            ) : null}

            {showBenchmarks ? (
              <td className={cs(styles.score)}>
                {benchmarkScores[factor.id] ? parseFloat(benchmarkScores[factor.id]).toFixed(precision) : ''}
              </td>
            ) : null}
          </tr>
        )
      })
    )
  }

  renderNoData () {
    return (
      <tr>
        <td className={styles.description}>{I18nStore.t('reports.modules.factors_table.no_data')}</td>
      </tr>
    )
  }

  renderHeader (headerShown) {
    if (!headerShown) {
      return null
    }

    const { model } = this.props
    const {
      scorePosition = 'inline', showIcons, showStrengthsBlindspots, showName, showDescription,
    } = model.props
    const filters = this.getFilters()
    const showWithFilters = (model.props.mode !== 'topFactors' && filters.length > 0)
    return (
      <thead>
        <tr>
          {this.canShowRank() && <th className={styles.rankOrder} scope="col">{I18nStore.t('reports.modules.factors_table.rank')}</th>}
          {(showIcons || showName || showDescription || showStrengthsBlindspots) ? (
            <th scope="col">{I18nStore.t('reports.modules.factors_table.description')}</th>
          ) : null}
          {model.props.showScore && scorePosition === 'inline' && !showWithFilters
            ? <th className={styles.score} scope="col">{I18nStore.t('reports.modules.factors_table.score')}</th> : null}
          {model.props.showScore && showWithFilters ? filters.map((filter, i) => (
            <th key={i} className={styles.filter} scope="col">{filter.name}</th>
          )) : null}
          {model.props.showBenchmarks
            ? <th className={styles.benchmarks} scope="col">{model.props.benchmarksLabel}</th>
            : null}
        </tr>
      </thead>
    )
  }

  render () {
    const { module, model } = this.props
    const { showBorder, backgroundColor } = model.props
    const { fontSize, fontFamily } = module.props.style
    const style = {
      fontSize,
      fontFamily,
      backgroundColor: backgroundColor || false,
    }
    this.prepareRows()
    const hasData = this.factorsData.length > 0
    return (
      <table className={cs(styles.table, styles[model.props.tableStyle || 'default'], { [styles.bordered]: showBorder })} style={style}>
        {hasData && this.renderHeader(model.props.showHeader)}
        <tbody>
          {hasData ? this.renderFactors() : this.renderNoData()}
        </tbody>
      </table>
    )
  }
}


export default connect(
  state => ({
    assessments: state.report.builder.assessments,
  }),
  {
  },
)(FactorsTable)
