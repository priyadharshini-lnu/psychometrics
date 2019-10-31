/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
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

  getColorByScoring (score) {
    if (score === 1 || score === 2) { return 'blue' }
    if (score === 3) { return 'orange' }
    if (score === 4 || score === 5) { return 'green' }
  }

  getTextByScoring (score) {
    if (score === 1) { return I18nStore.t('reports.modules.common.rare') }
    if (score === 2) { return I18nStore.t('reports.modules.common.less_typical') }
    if (score === 3) { return I18nStore.t('reports.modules.common.moderate') }
    if (score === 4) { return I18nStore.t('reports.modules.common.more_typical') }
    if (score === 5) { return I18nStore.t('reports.modules.common.almost_always') }
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
      this.topData = _.take(MockData, props.maxPosition - props.minPosition + 1)
    }
    if (props.reverseOrder) {
      this.topData.reverse()
    }
  }

  renderFactor (factor, conditionText) {
    return (
      <div className={styles.factor}>
        <div className={[styles.scoreIcon, styles[`scoreIcon${factor.meanNormScore}`]].join(' ')}>{factor.meanNormScore}</div>
        <div className={styles.factorName}>{I18nStore.tFactor(factor, 'alias')}</div>
        <div className={styles.factorDescription}>{conditionText || I18nStore.tFactor(factor, 'description')}</div>
      </div>
    )
  }

  render () {
    const { module } = this.props
    const { fontSize, fontFamily, width } = module.props.style
    const style = {
      fontSize,
      fontFamily,
      width,
    }
    this.prepareRows()
    return (
      <table className={styles.table} style={style}>
        {_.map(this.topData, (factor, i) => {
          const conditions = _.filter(module.textConditions, { factorId: factor.id })
          let conditionText = null
          let conditionStrengths = null
          let conditionBlindspots = null
          let conditionWorkstyles = null
          if (ResultStore.realResults) {
            for (let i = 0; i < conditions.length; i += 1) {
              conditionText = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(module.textConditions, conditions[i]), 'text')
              conditionStrengths = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(module.textConditions, conditions[i]), 'strengths')
              conditionBlindspots = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(module.textConditions, conditions[i]), 'blindspots')
              conditionWorkstyles = _.invoke(conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(module.textConditions, conditions[i]), 'workstyles')
              if (conditionText) { break }
            }
          } else {
            conditionText = factor.description
            conditionStrengths = factor.strengths
            conditionBlindspots = factor.blindspots
            conditionWorkstyles = factor.workstyles
          }
          return (
            <tbody key={i}>
              <tr>
                <td colSpan="3">
                  {this.renderFactor(factor, conditionText)}
                </td>
              </tr>
              <tr className={styles.tr}>
                <td style={{ width: '33%' }} className={styles.text}>
                  <strong>{I18nStore.tModule(module, 'strengths') || 'Strengths'}</strong>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionStrengths) }} />
                </td>
                <td style={{ width: '33%' }} className={styles.text}>
                  <strong>{I18nStore.tModule(module, 'blindspots') || 'Blindspots'}</strong>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionBlindspots) }} />
                </td>
                <td style={{ width: '33%' }} className={styles.text}>
                  <strong>{I18nStore.tModule(module, 'workstyles') || 'Workstyles'}</strong>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionWorkstyles) }} />
                </td>
              </tr>
            </tbody>
          )
        })}
      </table>
    )
  }
}

export default ResponseSummary
