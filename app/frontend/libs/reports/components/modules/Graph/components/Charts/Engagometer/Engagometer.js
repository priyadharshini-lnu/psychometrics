import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from 'rb/store/AppStore'
import LookupSourceName from 'rb/commands/LookupSourceName'
import styles from './Engagometer.scss'
import { changeLabel } from '../LabelChanger'
import ChartOptions from './ChartOptions'
import Series from './Series'
import { getCorrectResults } from '../ResultManager'

class Engagometer extends Component {
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

  renderChart () {
    const { model } = this.props
    const colors = _.map(model.props.colors, 'color')
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) { return null }

    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const data = Series[sourceType]
    if (!data) { return null }
    const series = data.series(getCorrectResults(model), sourceModel, model)

    if (!series.length) { return null }
    const { fontSize, fontColor: color, fontFamily } = model.props.style
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    this.chart = Highcharts.chart(this.container,
      _.merge(ChartOptions(model, e => this.changeBarLabel(data.collection, e), this.props),
        {
          // the value axis
          yAxis: {
            min: 0,
            max: 100,
            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',
            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
              step: 2,
              rotation: 'auto',
              style: {
                color,
                fontSize,
                fontFamily,
              },
            },
            title: false,
            plotBands: _.map(series, (ser, i) => ({
              from: ser.from,
              to: ser.to,
              color: colors[i],
            })),
          },
          legend: {
            itemStyle: {
              color,
              fontSize,
              fontFamily,
            },
            labelFormatter () {
              return `<span style="color:${this.color}">${this.name}</span>`
            },
            symbolWidth: 0,
          },
          series: _.map(sourceModel, (factor, i) => ({
            marker: { enabled: false },
            name: LookupSourceName.call(assessment, factor, sourceType),
            data: false,
            color: colors[i],
            showInLegend: true,
          })),
        }))
  }

  render () {
    return (
      <div ref={(ref) => { this.container = ref }} className={styles.chart} />
    )
  }
}

export default Engagometer
