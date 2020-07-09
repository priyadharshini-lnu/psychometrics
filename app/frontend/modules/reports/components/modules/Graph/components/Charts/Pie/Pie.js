import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import styles from './Pie.scss'
import { changeLabel } from '../LabelChanger'
import ChartOptions from './ChartOptions'
import Series from './Series'
import { getCorrectResults } from '../ResultManager'

const Formats = {
  Count: '{point.name}<br/> {point.y}',
  Mean: '{point.name}<br/> {point.y:.1f}',
  Percentile: '{point.name}:<br/> {point.y:.1f}%',
}

class Pie extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    animation: PropTypes.bool,
    preview: PropTypes.bool,
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

  get3DOptions () {
    const { model } = this.props
    if (model.props.graphicalRepresentation === '3D') {
      return {
        enabled: true,
        alpha: 45,
        beta: 0,
      }
    }
    return {
      enable: false,
    }
  }

  changePieLabel = (collectionName, e) => {
    const value = e.target.textContent
    const { model } = this.props
    changeLabel(model, value, collectionName)
  }

  renderChart () {
    const { model, animation, preview } = this.props
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) { return null }

    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const data = Series[sourceType]
    if (!data) { return null }
    const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat)
    const format = data.format ? data.format(model.props.dataFormat) : Formats[model.props.dataFormat]
    const labels = data.labels ? data.labels(sourceModel, model) : []
    if (!series.length) { return null }
    // clear empty results
    if (_.result(sourceModel, 'type') !== 'HotSpot') {
      series[0].data = _.filter(series[0].data, ser => ser.y > 0)
    }
    const self = this
    this.chart = Highcharts.chart(this.container,
      _.merge(ChartOptions(model, (...args) => changeLabel(model, ...args), this.props, format), {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          options3d: this.get3DOptions(),
          height: model.props.position.height - (preview ? 0 : 5),
        },
        legend: {
          enabled: !!data.hasLegend,
        },
        labels: {
          items: labels,
        },
        plotOptions: {
          pie: {
            innerSize: model.props.innerSize,
            size: '75%',
            depth: model.props.graphicalRepresentation === '3D' ? 35 : 0,
            allowPointSelect: false,
            cursor: 'pointer',
            dataLabels: {
              enabled: !!model.props.showValues,
              format,
              distance: 10,
              style: {
                color: model.props.style.fontColor || '#000',
                fontSize: model.props.style.fontSize || '11px',
                fontFamily: model.props.style.fontFamily,
              },
              events: {
                click (e) {
                  e.stopPropagation()
                  self.changePieLabel(data.collection, e)
                },
              },
            },
          },
          series: {
            animation,
          },
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

export default Pie
