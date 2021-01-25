/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'

import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import { TopFactorType } from 'rb/models/Results/interfaces'
import PieGraph from '../../../../../PieGraph'

import styles from './FactorsTable.scss'

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
    meanNormScore: 65.8,
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
  {
    id: 470,
    icon: Achievement,
    name: 'Achievement',
    alias: 'Achievement',
    meanNormScore: 35,
    strategy: 1,
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
    id: 471,
    icon: Accountability,
    name: 'Accountability',
    alias: 'Accountability',
    meanNormScore: 55,
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
    meanNormScore: 0.75,
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
    meanNormScore: 95,
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

  getMockData (size) {
    const data = []
    while (data.length < size && size > 0) {
      const items = _.take(MockData, size - data.length)
      data.push(...items)
    }
    return data
  }

  prepareRows () {
    const { module, module: { props } } = this.props
    if (ResultStore.realResults) {
      const sourceFactors = _.get(props, ['source', 'factors'], [])
      const factorIds = sourceFactors.map(f => f.id)
      if (props.mode === 'topFactors') {
        this.factorsData = ResultStore.results[module.assessment_id].getTopFactors(props.minPosition, props.maxPosition, factorIds, TopFactorType.Any)
      } else {
        const factorData = ResultStore.results[module.assessment_id].getTopFactors(0, factorIds.length, factorIds, TopFactorType.Any)
        this.factorsData = _.sortBy(factorData, f => factorIds.indexOf(f.id))
      }
    } else {
      this.factorsData = this.getMockData(props.maxPosition - props.minPosition + 1)
    }
    if (props.reverseOrder && props.mode === 'topFactors') {
      this.factorsData.reverse()
    }
  }

  canShowRank () {
    const { model: { props: { showRankOrder, mode } } } = this.props

    return (mode !== 'orderedFactors' && showRankOrder)
  }

  renderFactors () {
    const { model, module } = this.props
    const { fontFamily } = module.props.style

    return (
      this.factorsData.map((factor, i) => {
        const conditions = _.filter(module.textConditions, { factorId: factor.id })
        let conditionText = null
        let conditionStrengths = null
        let conditionBlindspots = null
        if (ResultStore.realResults) {
          for (let i = 0; i < conditions.length; i += 1) {
            conditionText = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
              _.indexOf(module.textConditions, conditions[i]), 'text')
            conditionStrengths = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
              _.indexOf(module.textConditions, conditions[i]), 'strengths')
            conditionBlindspots = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
              _.indexOf(module.textConditions, conditions[i]), 'blindspots')
            if (conditionText) { break }
          }
        } else {
          conditionText = factor.description
          conditionStrengths = factor.strengths
          conditionBlindspots = factor.blindspots
        }

        const score = _.round(factor.meanNormScore || factor.meanRawScore, 1)
        const percent = factor.strategy === 3 ? score : (score * 100) / 5 // 5-scale

        const {
          tableStyle, minPosition, maxPosition, reverseOrder, source: { factors },
          showDescription, showIcons, showStrengthsBlindspots, showScore,
        } = model.props
        const startRank = reverseOrder ? Math.max(1, factors.length - maxPosition + 1) : minPosition

        return (
          <tr key={i}>
            {this.canShowRank() && (
              <td className={styles.rankOrder}>
                <span className={tableStyle !== 'compact' ? cs(styles.star, 'fa', 'fa-star') : ''}>
                  <span className={styles.text} style={{ fontFamily }}>{startRank + i}</span>
                </span>
              </td>
            )}
            <td className={styles.description}>
              {showIcons && (
                <div className={styles.icons}>
                  <img src={factor.icon} />
                </div>
              )}
              <div className={styles.content}>
                <div className={styles.strength}>{I18nStore.tFactor(factor, 'alias')}</div>
                {showDescription && (
                  <div className={cs(styles.text, 'mt4')}>{conditionText}</div>
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
            </td>
            {showScore && (
              <td className={styles.score}>
                {tableStyle !== 'compact'
                  ? (
                    <PieGraph
                      strokeWidth="10"
                      text={score}
                      percent={Math.min(percent, 100)}
                    />
                  )
                  : score}
              </td>
            )}
          </tr>
        )
      })
    )
  }

  renderHeader (headerShown) {
    if (!headerShown) {
      return null
    }

    const { model } = this.props
    return (
      <thead>
        <tr>
          {this.canShowRank() && <th className={styles.rankOrder} scope="col">{I18nStore.t('reports.modules.factors_table.rank')}</th>}
          <th scope="col">{I18nStore.t('reports.modules.factors_table.description')}</th>
          {model.props.showScore && <th className={styles.score} scope="col">{I18nStore.t('reports.modules.factors_table.score')}</th>}
        </tr>
      </thead>
    )
  }

  render () {
    const { module, model } = this.props
    const { fontSize, fontFamily } = module.props.style
    const style = {
      fontSize,
      fontFamily,
    }
    this.prepareRows()
    return (
      <table className={cs(styles.table, styles[model.props.tableStyle || 'default'])} style={style}>
        {this.renderHeader(model.props.showHeader)}
        <tbody>
          {this.renderFactors()}
        </tbody>
      </table>
    )
  }
}

export default FactorsTable
