import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import styles from './Bar.scss'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'

const Formats = {
  Count: '{point.y}',
  Mean: '{point.y:.1f}',
  Percentile: '{point.y:.1f}%',
}

class Bar extends Component {
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

  componentWillUnmount () {
    if (this.chart) {
      this.chart.destroy()
    }
  }

  get3DOptions () {
    const { model } = this.props
    if (model.props.graphicalRepresentation === '3D') {
      return {
        enabled: true,
        alpha: 5,
        beta: 15,
        depth: 50,
        viewDistance: 25,
      }
    }
    return {
      enable: false,
    }
  }

  changeBarLabel = (collectionName, label) => {
    const { model } = this.props
    changeLabel(model, label.value, collectionName)
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
    if (sourceType === 'EmbeddedData' && !sourceModel.name) { return null }
    const data = Series[sourceType]
    if (!data) { return null }
    const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat)
    const format = data.format ? data.format(model.props.dataFormat) : Formats[model.props.dataFormat]
    if (!series.length) { return null }
    let legendVerticalPosition = 'Bottom'
    let legendHorizontalPosition = 'Middle'
    if (model.props.legendPosition) {
      [legendVerticalPosition, legendHorizontalPosition] = model.props.legendPosition.split(' ')
      if (legendHorizontalPosition === 'Middle') { legendHorizontalPosition = 'Center' }
    }
    this.chart = Highcharts.chart(
      this.container,
      _.merge(
        ChartOptions(model, e => this.changeBarLabel(data.collection, e), this.props, format),
        {
          chart: {
            type: model.props.graphicalPosition === 'Vertical' ? 'column' : 'bar',
            options3d: this.get3DOptions(),
          },
          animation,
          legend: {
            enabled: model.props.showLegend,
            align: legendHorizontalPosition.toLowerCase(),
            verticalAlign: legendVerticalPosition.toLowerCase(),
          },
          plotOptions: {
            series: {
              allowPointSelect: false,
              animation,
              borderWidth: 0,
              dataLabels: {
                enabled: !!model.props.showValues,
                format,
              },
            },
            column: {
              depth: model.props.graphicalRepresentation === '3D' ? 35 : 0,
            },
          },
          series,
        },
      ),
    )
  }

  render () {
    return (
      <div ref={(ref) => { this.container = ref }} className={styles.graph} />
    )
  }
}

export default Bar
