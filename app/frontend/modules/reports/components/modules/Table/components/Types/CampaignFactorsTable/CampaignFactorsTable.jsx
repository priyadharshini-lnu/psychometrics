/* eslint-disable max-len */
import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'

import ResultStore from '~/modules/reports/store/ResultStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import BulletGraph from '~/modules/reports/components/BulletGraph'
import PieGraph from '~/modules/reports/components/PieGraph'
import styles from './CampaignFactorsTable.less'
import { PaginationContext } from '../FactorsTable/PaginationContext'

const campaignFactorMockData = [
  {
    code: 'ambiguity',
    name: 'Ambiguity',
    label: 'High',
    color: '#666666',
    value: 65.8888,
    strategy: 0,
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
  },
  {
    code: 'achievement',
    name: 'Achievement',
    label: 'Medium',
    color: '#999999',
    value: 35,
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
  },
  {
    code: 'accountability',
    name: 'Accountability',
    label: 'Medium',
    color: '#999999',
    value: 55,
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
  },
  {
    id: 'ambition',
    name: 'Ambition',
    label: 'Low',
    color: '#aaaaaa',
    value: 0.75,
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
  },
  {
    id: 'agility',
    name: 'Agility',
    label: 'High',
    color: '#666666',
    value: 95,
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
  },
]

class CampaignFactorsTable extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  state = {
    paginationContext: null,
  }

  componentDidMount () {
    const { module: model, insertPaginationPage, preview } = this.props
    if (!model.props.pagination?.enabled) { return }
    if (!preview) { return }

    if (model.pagination) {
      this.setState({ paginationContext: model.pagination })
      return
    }

    const element = document.querySelector(`[data-table="${model.id}"]`)
    const context = new PaginationContext(model, element)

    if (!context.needPagination) {
      return
    }
    this.setState({ paginationContext: context.pages[0] })
    if (insertPaginationPage) {
      insertPaginationPage(model, context)
    }
  }

  getCampaignFactorMockData (campaignFactors, size) {
    const data = []
    while (data.length < size && size > 0) {
      const items = _.take(campaignFactorMockData, size - data.length)
      data.push(...items)
    }
    return data.map((campaignFactor, i) => ({
      ...campaignFactor,
      ...campaignFactors[i],
    }))
  }

  prepareCampaignFactorTableRows () {
    const { module, module: { props } } = this.props
    const { paginationContext } = this.state

    const sourceCampaignFactors = _.get(props, ['source', 'campaignFactors'], [])
    const scoreRangeMin = _.get(props, ['scoreRangeMin'], -Infinity)
    const scoreRangeMax = _.get(props, ['scoreRangeMax'], Infinity)
    const campaignFactorCodes = sourceCampaignFactors.map(f => f.code)
    if (ResultStore.realResults) {
      if (props.mode === 'topFactors') {
        this.campaignFactorsData = ResultStore.results[module.assessment_id].getTopCampaignFactors(
          props.minPosition, props.maxPosition, campaignFactorCodes, scoreRangeMin, scoreRangeMax,
        )
      } else {
        const factorData = ResultStore.results[module.assessment_id].getTopCampaignFactors(0, campaignFactorCodes.length, campaignFactorCodes)
        this.campaignFactorsData = _.sortBy(factorData, f => campaignFactorCodes.indexOf(f.code))
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (props.mode === 'topFactors') {
        this.campaignFactorsData = this.getCampaignFactorMockData(sourceCampaignFactors, props.maxPosition - props.minPosition + 1)
      } else {
        this.campaignFactorsData = this.getCampaignFactorMockData(sourceCampaignFactors, campaignFactorCodes.length)
      }
    }
    if (props.reverseOrder && props.mode === 'topFactors') {
      this.campaignFactorsData.reverse()
    }
    if (paginationContext) {
      this.campaignFactorsData = this.campaignFactorsData.filter(f => paginationContext.factorIds.includes(f.code))
    }
  }

  canShowRank () {
    const { model: { props: { showRankOrder, mode } } } = this.props

    return (mode !== 'orderedFactors' && showRankOrder)
  }

  renderCampaignFactors () {
    const { model, module } = this.props
    const { fontFamily } = module.props.style
    return (
      this.campaignFactorsData.map((campaignfactor, i) => {
        const conditions = _.filter(module.textConditions, { campaignFactorCode: campaignfactor.code })
        let conditionTitle = null
        let conditionText = null
        let conditionStrengths = null
        let conditionBlindspots = null
        let conditionLabel = null
        let conditionColor = null
        let conditionBaselineScore = null
        const campaignFactorValue = campaignfactor.value
        if (ResultStore.realResults) {
          for (let i = 0; i < conditions.length; i += 1) {
            conditionTitle = _.invoke(conditions[i], 'getTextByCondition', campaignFactorValue,
              _.indexOf(module.textConditions, conditions[i]), 'title')
            conditionText = _.invoke(conditions[i], 'getTextByCondition', campaignFactorValue,
              _.indexOf(module.textConditions, conditions[i]), 'text')
            conditionStrengths = _.invoke(conditions[i], 'getTextByCondition', campaignFactorValue,
              _.indexOf(module.textConditions, conditions[i]), 'strengths')
            conditionBlindspots = _.invoke(conditions[i], 'getTextByCondition', campaignFactorValue,
              _.indexOf(module.textConditions, conditions[i]), 'blindspots')
            conditionLabel = _.invoke(conditions[i], 'getTextByCondition', campaignFactorValue,
              _.indexOf(module.textConditions, conditions[i]), 'label')
            conditionColor = _.invoke(conditions[i], 'getColorByCondition', campaignFactorValue)
            conditionBaselineScore = _.invoke(conditions[i], 'getValueByCondition', campaignFactorValue, 'baselineScore')
            if (conditionTitle || conditionText || conditionStrengths
              || conditionBlindspots || conditionLabel || conditionColor
              || conditionBaselineScore) {
              break
            }
          }
        } else {
          conditionText = campaignfactor.description
          conditionStrengths = campaignfactor.strengths
          conditionBlindspots = campaignfactor.blindspots
          conditionLabel = campaignfactor.label
          conditionColor = campaignfactor.color
          conditionBaselineScore = 3.5
        }

        conditionTitle = conditionTitle ?? I18nStore.tFactorName(campaignfactor)
        conditionText = conditionText ?? I18nStore.tFactor(campaignfactor, 'description')
        conditionColor = conditionColor ?? '#666666'

        const {
          tableStyle = 'default', minPosition, maxPosition, reverseOrder, source: { campaignFactors },
          showDescription, showStrengthsBlindspots, showScore, showName, showLabel,
          scoreProgressColor, scoreBackgroundColor, maxScoreValue, scorePosition = 'inline',
          scoreDisplay = 'circular', scoreRanges = [], scoreLineColor, scoreBulletColor, precision,
          showScoreText, scoreBulletGraphHeight,
        } = model.props

        const startRank = reverseOrder ? Math.max(1, campaignFactors.length - maxPosition + 1) : minPosition

        const score = _.isNil(precision) ? campaignFactorValue : _.round(campaignFactorValue, precision)
        const maxValue = maxScoreValue ?? (campaignfactor.strategy === 3 ? 100 : 5)
        const percent = score * 100 / maxValue
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
          <tr data-row={i} data-factor-id={campaignfactor.code} key={i}>
            {this.canShowRank() && (
              <td className={styles.rankOrder}>
                <span className={tableStyle !== 'compact' ? cs(styles.star, 'icon-star') : ''}>
                  <span className={styles.text} style={{ fontFamily }}>{startRank + i}</span>
                </span>
              </td>
            )}
            {(showName || showDescription || (showScore && scorePosition === 'block')) && (
              <td className={styles.description}>
                {(showName || showDescription || showStrengthsBlindspots || (showScore && scorePosition === 'block')) && (
                  <div className={styles.content}>
                    {showName && (
                      <div className={styles.strength}>
                        {_.isEmpty(conditionTitle) ? I18nStore.tFactor(campaignfactor, 'alias') : conditionTitle}
                      </div>
                    )}
                    {scorePosition === 'block' ? scoreUI : null}
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
            {((showScore && scorePosition === 'inline') || (showLabel && !showScore)) ? (
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
      scorePosition = 'inline', showStrengthsBlindspots, showName, showDescription,
    } = model.props
    return (
      <thead data-table-header>
        <tr>
          {this.canShowRank() && <th className={styles.rankOrder} scope="col">{I18nStore.t('reports.modules.factors_table.rank')}</th>}
          {(showName || showDescription || showStrengthsBlindspots) ? (
            <th scope="col">{I18nStore.t('reports.modules.factors_table.description')}</th>
          ) : null}
          {model.props.showScore && scorePosition === 'inline'
            ? <th className={styles.score} scope="col">{I18nStore.t('reports.modules.factors_table.score')}</th> : null}
        </tr>
      </thead>
    )
  }

  render () {
    const { module, model } = this.props
    const { showBorder, backgroundColor } = model.props
    const { fontSize, fontFamily, fontColor } = module.props.style
    const style = {
      fontSize,
      fontFamily,
      backgroundColor: backgroundColor || false,
      color: fontColor,
    }
    this.prepareCampaignFactorTableRows()
    const hasData = this.campaignFactorsData.length > 0
    return (
      <table
        data-table={model.id}
        className={cs(styles.table, styles[model.props.tableStyle || 'default'], { [styles.bordered]: showBorder })}
        style={style}
      >
        {hasData && this.renderHeader(model.props.showHeader)}
        <tbody>
          {hasData ? this.renderCampaignFactors() : this.renderNoData()}
        </tbody>
      </table>
    )
  }
}


export default connect(
  () => ({}),
  {
  },
)(CampaignFactorsTable)
