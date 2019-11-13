/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PropertyPanelStore'
import { renderMarkdown } from 'rb/utils/Markdown'
import CircularProgress from './CircularProgress'
import styles from './InnovationStyles.scss'

const SCORE_PROGRESS_SIZE = 130

const MockCondtionData = {
  strengths: `
* Lorem ipsum dolor sit amet consectetur adipisicing
  `,
  blindspots: `
* Lorem ipsum dolor sit amet consectetur adipisicing
  `,
}

class InnovationStyles extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  componentDidMount () {
    this.propPanelListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.propPanelListener.remove()
  }

  prepareRows () {
    const { module } = this.props
    const { props } = module
    let innovationStyles
    let offset = (props.pageNumber || 1) - 1
    const limit = props.itemsPerPage || 10
    if (ResultStore.realResults) {
      innovationStyles = ResultStore.results[module.assessment_id].getInnovationStyles()
    } else {
      const assessment = _.find(AppStore.assessments, { id: module.assessment_id })
      const dimensionId = assessment && assessment.dimensionId
      offset = 0
      innovationStyles = _.map(AppStore.innovationStyles[dimensionId], innovationStyle => ({
        id: innovationStyle.id,
        score: _.random(50, 100),
        name: I18nStore.tInnovationStyle(innovationStyle, 'name'),
        description: I18nStore.tInnovationStyle(innovationStyle, 'description'),
        icon: innovationStyle.icon,
        position: innovationStyle.position,
      }))
    }
    innovationStyles = _.sortBy(innovationStyles, 'position')
    this.innovationStyles = _.slice(innovationStyles, offset, offset + limit)
  }

  render () {
    const { module: model } = this.props
    const { fontSize, fontFamily, width } = model.props.style
    const style = {
      fontSize,
      fontFamily,
      width,
    }
    const circleStyle = {
      stroke: '#C8FDFF',
    }
    const barStyle = {
      stroke: '#2DCCD3',
    }
    const scale = parseInt(fontSize, 10) / 100
    this.prepareRows()
    return (
      <div className={styles.table}>
        <div style={style}>
          {_.map(this.innovationStyles, (innovationStyle) => {
            const conditions = _.filter(model.textConditions, { innovationStyleId: innovationStyle.id })
            let conditionStrengths = null
            let conditionBlindspots = null
            if (ResultStore.realResults) {
              for (let i = 0; i < conditions.length; i += 1) {
                conditionStrengths = _.invoke(conditions[i], 'getTextByCondition', innovationStyle.score,
                  _.indexOf(model.textConditions, conditions[i]), 'strengths')
                conditionBlindspots = _.invoke(conditions[i], 'getTextByCondition', innovationStyle.score,
                  _.indexOf(model.textConditions, conditions[i]), 'blindspots')
                if (conditionStrengths || conditionBlindspots) {
                  break
                }
              }
            } else {
              conditionStrengths = MockCondtionData.strengths
              conditionBlindspots = MockCondtionData.blindspots
            }
            return (
              <div className={styles.row} key={innovationStyle.id}>
                <div className={styles.score}>
                  <CircularProgress
                    value={innovationStyle.score}
                    size={SCORE_PROGRESS_SIZE * scale}
                    circleStyle={circleStyle}
                    barStyle={barStyle}
                  />
                </div>
                <div className={styles.details}>
                  <div className={styles.detailsTop}>
                    <div className={styles.icon}>
                      <img src={innovationStyle.icon} />
                    </div>
                    <div className={styles.description}>
                      <div className={styles.name}>{I18nStore.tInnovationStyle(innovationStyle, 'name')}</div>
                      <div className={styles.descriptionText}>
                        {I18nStore.tInnovationStyle(innovationStyle, 'description')}
                      </div>
                    </div>
                  </div>
                  <div className={styles.detailsBottom}>
                    <div
                      className={styles.strengths}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionStrengths) }}
                    />
                    <div
                      className={styles.blindspots}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(conditionBlindspots) }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default InnovationStyles
