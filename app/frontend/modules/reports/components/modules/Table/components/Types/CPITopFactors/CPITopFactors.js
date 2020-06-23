/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cs from 'classnames'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import { renderMarkdown } from 'rb/utils/Markdown'
import styles from './CPITopFactors.scss'

const MockData = [
  {
    id: 469,
    name: 'Angular',
    alias: 'Angular',
    meanNormScore: 4,
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
    name: 'Contemplative',
    alias: 'Contemplative',
    meanNormScore: 3,
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
    name: 'Conceptual',
    alias: 'Conceptual',
    meanNormScore: 2,
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
    name: 'Contemplative',
    alias: 'Contemplative',
    meanNormScore: 3,
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
    name: 'Conceptual',
    alias: 'Conceptual',
    meanNormScore: 1,
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

class ResponseSummary extends Component {
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
      let factorIds = []
      if (props.source && props.source.factors) {
        factorIds = _.map(props.source.factors, 'id')
      }
      this.topData = ResultStore.results[module.assessment_id].getTopFactors(props.minPosition, props.maxPosition, factorIds)
    } else {
      this.topData = this.getMockData(props.maxPosition - props.minPosition + 1)
    }
    if (props.reverseOrder) {
      this.topData.reverse()
    }
  }

  renderFactors () {
    const { model, module } = this.props

    return (
      this.topData.map((factor, i) => {
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

        const {
          tableStyle, minPosition, maxPosition, reverseOrder, source: { factors },
        } = model.props
        const listStyle = tableStyle === 'compact' ? styles.defaultLists : styles.styledLists
        const startRank = reverseOrder ? Math.max(1, factors.length - maxPosition + 1) : minPosition
        return (
          <tr key={i}>
            {model.props.showRankOrder && (
              <td className={styles.rankOrder}>
                <span className={tableStyle !== 'compact' ? styles.rankAvatar : ''}>
                  <span className={styles.rankText}>{startRank + i}</span>
                </span>
              </td>
            )}
            <td className={styles.strength}>{I18nStore.tFactor(factor, 'alias')}</td>
            {model.props.showDescription && <td className={styles.description}>{conditionText}</td>}
            {model.props.showStrengthsBlindspots && (
              <td className={cs(styles.strengthsBlindspots, listStyle)}>
                <div className={styles.strengths} dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionStrengths) }} />
                <div className={styles.blindspots} dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionBlindspots) }} />
              </td>
            )}
            {model.props.showScore && <td className={styles.score}>{factor.meanNormScore}</td>}
          </tr>
        )
      })
    )
  }

  renderHeader (headerShown) {
    if (!headerShown) {
      return null
    }

    const { module, model } = this.props
    return (
      <thead>
        <tr>
          {model.props.showRankOrder && <th className={styles.rankOrder} scope="col">{I18nStore.tModule(module, 'rankOrder') || 'Rank'}</th>}
          <th scope="col">{I18nStore.tModule(module, 'strength') || 'Strength'}</th>
          {model.props.showDescription && <th scope="col">{I18nStore.tModule(module, 'description') || 'Description'}</th>}
          {model.props.showStrengthsBlindspots && <th scope="col">{I18nStore.tModule(module, 'strengthsBlindspots') || 'Strengths & Blindspots'}</th>}
          {model.props.showScore && <th className={styles.score} scope="col">{I18nStore.tModule(module, 'score') || 'Score'}</th>}
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
      <table className={cs(styles.table, styles[model.props.tableStyle])} style={style}>
        {this.renderHeader(model.props.showHeader)}
        <tbody>
          {this.renderFactors()}
        </tbody>
      </table>
    )
  }
}

export default ResponseSummary
