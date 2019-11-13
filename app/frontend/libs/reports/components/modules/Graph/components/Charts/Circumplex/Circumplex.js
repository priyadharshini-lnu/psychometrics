import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'
import * as d3 from 'd3'
import styles from './Circumplex.scss'
import { changeLabel } from '../LabelChanger'
import Series from './Series'
import { getCorrectResults } from '../ResultManager'
import Container from './Shapes/Container'

class Circumplex extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    this.renderChart()
  }

  componentDidUpdate () {
    this.renderChart()
  }

  componentWillUnmount () {
    if (this.chart) {
      this.chart.destroy()
    }
  }

  changeBarLabel = (collectionName, label) => {
    const { model } = this.props
    changeLabel(model, label.value, collectionName)
  }

  calcSeriesData () {
    const { model } = this.props
    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const mapSubFactors = {}
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    _.each(AppStore.factors[dimensionId], (factor) => {
      if (factor.parent_id) {
        if (!mapSubFactors[factor.parent_id]) {
          mapSubFactors[factor.parent_id] = []
        }
        mapSubFactors[factor.parent_id].push(factor)
      }
    })

    const data = Series[sourceType]
    if (!data) { return null }
    const colors = _.map(model.props.colors, 'color')
    const seriesData = []
    _.each(sourceModel, (factor, i) => {
      const subFactorsByFactor = mapSubFactors[factor.id]
      const color = colors[i % colors.length]
      const result = {
        id: factor.id,
        name: I18nStore.tFactorName(factor),
        color,
        subFactors: [],
      }
      if (subFactorsByFactor) {
        result.subFactors = _.map(subFactorsByFactor, subFactor => ({
          parent_id: factor.id,
          color,
          name: I18nStore.tFactorName(subFactor),
          scoring: parseInt(data.series(getCorrectResults(model), subFactor), 10),
        }))
        seriesData.push(result)
      }
    })
    return seriesData
  }

  renderChart () {
    const { model } = this.props
    if (!model.props.source) { return null }
    const sourceType = model.getSourceType()
    const data = Series[sourceType]
    if (!data) { return null }
    const seriesData = this.calcSeriesData()
    if (this.svg) {
      this.svg.remove()
      this.svg = null
    }
    const minSide = model.getMinSide()
    this.svg = d3.select(`#circumplex-container-${model.id}`).append('svg')
      .attr('width', minSide)
      .attr('height', minSide)
    this.svgWrapper = this.svg.append('g').attr('class', 'wrapper')
      .attr('transform', `translate(${minSide / 2}, ${minSide / 2})`)

    const container = new Container(model, seriesData, this.svgWrapper)
    container.render(seriesData)
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.container} id={`circumplex-container-${model.id}`} />
    )
  }
}

export default Circumplex
