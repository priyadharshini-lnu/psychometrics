/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import cs from 'classnames'
import { renderMarkdown } from 'rb/utils/Markdown'
import styles from './StrengthClusters.scss'

const MockSubfactors = [
  {
    id: 470,
    name: 'Contemplative',
    alias: 'Contemplative',
    meanNormScore: 3,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
  },
  {
    id: 471,
    name: 'Conceptual',
    alias: 'Conceptual',
    meanNormScore: 2,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod ',
  },
  {
    id: 473,
    name: 'Conceptual',
    alias: 'Conceptual',
    meanNormScore: 1,
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
]

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
    possibleRoles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    color: '#3A86B4',
    subfactors: MockSubfactors,
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
    possibleRoles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    color: '#C07C74',
    subfactors: MockSubfactors,
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
    possibleRoles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    color: '#8DB179',
    subfactors: MockSubfactors,
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
    possibleRoles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    color: '#4E996E',
    subfactors: MockSubfactors,
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
    possibleRoles: `
* Lorem ipsum dolor sit amet consectetur adipisicing
* Consectetur adipisicing elit, sed do eiusmod tempor incididunt
* Ipsum dolor sit amet, consectetur adipisicing elit
    `,
    color: '#CB9770',
    subfactors: MockSubfactors,
  },
]

class StrengthClusters extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    const { module, module: { props } } = this.props
    if (ResultStore.realResults) {
      const factorIds = _.map(props.source.factors, 'id')
      this.topData = ResultStore.results[module.assessment_id]
        .getTopFactors(props.minPosition, props.maxPosition, factorIds, false)
    } else {
      this.topData = _.take(MockData, props.maxPosition - props.minPosition + 1)
    }
    if (props.reverseOrder) {
      this.topData.reverse()
    }
  }

  renderFactor (factor, color) {
    const factorStyle = {
      backgroundColor: color || '#ccc',
    }
    return (
      <div className={styles.factor}>
        <div className={styles.factorNameWrap} style={factorStyle}>
          <div className={styles.factorName}>{I18nStore.tFactor(factor, 'alias')}</div>
        </div>
        <div className={[styles.scoreIcon, styles[`scoreIcon${factor.meanNormScore}`]].join(' ')}>{factor.meanNormScore}</div>
        {/* <div className={styles.factorDescription}>{conditionText || I18nStore.tFactor(factor, 'description')}</div> */}
      </div>
    )
  }

  renderSubfactor (factor) {
    return (
      <div>
        <div className={styles.subfactorName}>{I18nStore.tFactor(factor, 'alias')}</div>
        <div className={styles.scale}>
          {_.times(5, x => (
            <div key={x} className={cs(styles.cell, factor.meanNormScore === x + 1 ? styles.active : null)}>
              <div className={styles.bar} />
              <div className={styles.score}>{x + 1}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  renderSubfactorDescription (factor, model) {
    let conditionText = null
    const conditions = _.filter(model.textConditions, { factorId: factor.id })
    if (ResultStore.realResults) {
      for (let i = 0; i < conditions.length; i += 1) {
        conditionText = _.invoke(
          conditions[i], 'getTextByCondition', factor.meanNormScore,
          _.indexOf(model.textConditions, conditions[i]), 'text',
        )
        if (conditionText) { break }
      }
    } else {
      conditionText = factor.description
    }
    return <div>{conditionText || I18nStore.tFactor(factor, 'description')}</div>
  }

  render () {
    const { module: model } = this.props

    const { fontSize, fontFamily, width } = model.props.style
    const style = {
      fontSize,
      fontFamily,
      width,
    }
    this.prepareRows()
    return (
      <table className={styles.table} style={style}>
        {_.map(this.topData, (factor, i) => {
          const conditions = _.filter(model.textConditions, { factorId: factor.id })
          let conditionText = null
          let conditionWorkstyles = null
          let conditionPossibleRoles = null
          let conditionColor = null
          let subfactors = null
          if (ResultStore.realResults) {
            for (let i = 0; i < conditions.length; i += 1) {
              conditionText = _.invoke(
                conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(model.textConditions, conditions[i]), 'text',
              )
              conditionWorkstyles = _.invoke(
                conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(model.textConditions, conditions[i]), 'workstyles',
              )
              conditionPossibleRoles = _.invoke(
                conditions[i], 'getTextByCondition', factor.meanNormScore,
                _.indexOf(model.textConditions, conditions[i]), 'possibleRoles',
              )
              conditionColor = _.invoke(conditions[i], 'getColorByCondition', factor.meanNormScore)
              if (conditionText) { break }
            }
            subfactors = ResultStore.results[model.assessment_id].getSubFactors(1, 3, factor.id)
          } else {
            conditionText = factor.description
            conditionWorkstyles = factor.workstyles
            conditionPossibleRoles = factor.possibleRoles
            conditionColor = factor.color
            // eslint-disable-next-line prefer-destructuring
            subfactors = factor.subfactors
          }
          if (factor.meanNormScore <= 0) return
          return (

            <tbody key={i}>
              <tr>
                <td rowSpan="4" className={cs(styles.tdFactor, styles.roundedTopLeft, styles.roundedBottomLeft)}>
                  {this.renderFactor(factor, conditionColor)}
                </td>
                <td colSpan="2" className={cs(styles.description, styles.roundedTopRight)}>
                  <div>
                    {conditionText || I18nStore.tFactor(factor, 'description')}
                  </div>
                </td>
              </tr>
              <tr className={styles.tr}>
                <td className={cs(styles.text, styles.roles, styles.darkGrayBg)}>
                  <div>
                    <strong>{I18nStore.t('reports.modules.strength_clusters.possible_roles')}</strong>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionPossibleRoles) }} />
                  </div>
                </td>
                <td className={cs(styles.text, styles.workstyles, styles.darkGrayBg)}>
                  <div>
                    <strong>{I18nStore.t('reports.modules.strength_clusters.work_environments')}</strong>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionWorkstyles) }} />
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan="2" className={styles.subfactorsTitle} style={{ backgroundColor: conditionColor }}>{I18nStore.t('reports.modules.strength_clusters.index_sub_factors_considered', { workstyle: I18nStore.tFactor(factor, 'alias') })}</td>
              </tr>
              <tr>
                <td colSpan="3" className={cs(styles.roundedBottomRight, styles.subfactors)}>
                  <table>
                    <tbody>
                      <tr>
                        {subfactors.map((sf, i) => (
                          <th key={i} className={cs(styles.tdSubfactor, styles.darkGrayBg)}>
                            {this.renderSubfactor(sf)}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {subfactors.map((sf, i) => (
                          <td key={i} className={styles.tdFactorDescription}>
                            {this.renderSubfactorDescription(sf, model)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr className={styles.spacer}>
                <td colSpan="3">&nbsp;</td>
              </tr>
            </tbody>
          )
        })}
      </table>
    )
  }
}

export default StrengthClusters
