import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import styles from './Line.scss'
import ChartOptions from './ChartOptions'
import Series from './Series'

const Formats = {
  Count: '{point.name}<br/> {point.y}',
  Mean: '{point.name}<br/> {point.y:.1f}',
  Percentile: '{point.name}<br/> {point.y:.1f}%',
}

class Line extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    animation: PropTypes.bool,
  }

  static defaultProps = {
    animation: false,
  }

  componentDidMount () {
    this.renderChart()
  }

  componentDidUpdate () {
    this.renderChart()
  }

  changeLineLabel = (collectionName, e) => {
    const value = e.target.textContent
    const { model } = this.props
    changeLabel(model, value, collectionName)
  }

  renderChart () {
    const { model, animation } = this.props

    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) { return null }

    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const data = Series[sourceType]

    if (!data) { return null }
    if (sourceType === 'Question' && sourceModel.type === 'TextEntry') { return null }
    const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat)
    const format = data.format ? data.format(model.props.dataFormat) : Formats[model.props.dataFormat]
    const labels = data.labels ? data.labels(sourceModel, model) : []
    let xAxis = _.invoke(data, 'xAxis', sourceModel, model, model.props.dataFormat, getCorrectResults(model)) || {}
    if (model.props.xAxisLinesHide) {
      xAxis = _.merge(xAxis, {
        lineWidth: 0,
        minorGridLineWidth: 0,
        gridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
      })
    }
    if (!series.length) { return null }

    const { fontSize, fontColor: color, fontFamily } = model.props.style

    this.chart = Highcharts.chart(this.container,
      _.merge(ChartOptions(model, (...args) => changeLabel(model, ...args), this.props, format), {
        legend: {
          enabled: !!data.hasLegend,
        },
        labels: {
          items: labels,
        },
        plotOptions: {
          line: {
            animation,
            dataLabels: {
              enabled: !!model.props.showValues,
              format,
            },
            lineWidth: model.props.lineWidth,
            marker: {
              enabled: true,
            },
            enableMouseTracking: false,
          },
        },
        xAxis: _.merge(xAxis, {
          type: 'category',
          labels: {
            style: {
              fontSize: fontSize || '11px',
              color: color || '#000',
              fontFamily,
            },
            events: {
              click (e) {
                e.stopPropagation()
                changeLabel(model, this.value, 'choicesTexts')
              },
            },
          },
        }),
        yAxis: {
          gridLineWidth: model.props.yAxisLinesHide ? 0 : 1,
          title: { enabled: !model.props.yAxisTitleDisabled },
        },
        series,
      }))
  }

  render () {
    return (
      <div ref={(ref) => { this.container = ref }} className={styles.graph} />
    )
  }
}

export default Line
