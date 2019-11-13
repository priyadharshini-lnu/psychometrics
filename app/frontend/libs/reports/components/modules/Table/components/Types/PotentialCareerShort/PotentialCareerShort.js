/* eslint-disable no-multi-str */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import AppStore from 'rb/store/AppStore'
import styles from './PotentialCareerShort.scss'

const MockFactors = [
  {
    id: 469,
    name: 'Angular',
    meanNormScore: 4,
  },
  {
    id: 470,
    name: 'Contemplative',
    meanNormScore: 3,
  },
  {
    id: 471,
    name: 'Conceptual',
    meanNormScore: 1,
  },
]
const MockOccupation = {
  id: 1,
  name: 'ART / MEDIA / PUBLISHING',
  color: '#36A9BD',
  description: 'Roles within Arts, Media and Publishing involve the creation of artistic visual and\
  written content. It includes roles working with written publications such as books,\
  scripts and magazines and creating art pieces and installations. It can also\
involve working with various audio, visual and print media including television\
and film. Creativity is integral to these roles, and they often require individuals to\
get absorbed in the creative process or a performance. Roles may involve the\
direction and coordination of performance pieces, publication or artistic displays\
and as such require good coordination and team work skills.',
}

class ResponseSummary extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  prepareRows () {
    const { module, module: { props } } = this.props
    const assessment = _.find(AppStore.assessments, { id: module.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    if (ResultStore.realResults) {
      this.occupationData = ResultStore.results[module.assessment_id].getOccupationByRank(props.topPosition)
    } else {
      this.occupationData = AppStore.occupations[dimensionId][props.topPosition] || MockOccupation
      this.occupationData.factors = MockFactors
    }
  }

  render () {
    const { module: { props }, module } = this.props
    const { fontSize, fontFamily } = module.props.style
    const style = {
      fontSize,
      fontFamily,
    }
    this.prepareRows()
    if (!this.occupationData) { return false }

    const titleStyle = {}
    const lineStyle = {}
    if (this.occupationData.color) {
      titleStyle.color = this.occupationData.color
      lineStyle.backgroundColor = this.occupationData.color
    }

    return (
      <div className={styles.container} style={style}>
        <div className={styles.header}>
          <div className={styles.position}>
            {props.topPosition}
            .
          </div>
          <img src={this.occupationData.icon} className={styles.icon} />
          <div className={styles.title}>{I18nStore.tOccupation(this.occupationData, 'name')}</div>
          <div className={styles.line} style={lineStyle} />
        </div>
        <div className={styles.description}>
          {I18nStore.tOccupation(this.occupationData, 'description')}
        </div>
      </div>
    )
  }
}

export default ResponseSummary
