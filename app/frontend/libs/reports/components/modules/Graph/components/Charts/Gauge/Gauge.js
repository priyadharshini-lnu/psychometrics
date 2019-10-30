import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from 'rb/store/AppStore'
import LookupSourceName from 'rb/commands/LookupSourceName'
import styles from './Gauge.scss'
import { changeLabel } from '../LabelChanger'
import ChartOptions from './ChartOptions'
import Series from './Series'
import { getCorrectResults } from '../ResultManager'


class Gauge extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    animation: PropTypes.bool,
  }

  static defaultProps = {
    animation: false,
  }

  componentDidMount () {
    this.renderCharts()
  }

  componentDidUpdate () {
    this.renderCharts()
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

  renderChart (factor) {
    const { model, animation } = this.props
    const { fontSize, fontColor: color, fontFamily } = model.props.style
    const data = Series[model.getSourceType()]
    const series = data.series(getCorrectResults(model), factor, model)
    const { props } = model
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    Highcharts.chart(this.container, Highcharts.merge(ChartOptions(), {
      plotOptions: {
        series: {
          colors: [props.speedometerMainColor],
          animation,
        },
      },
      yAxis: {
        title: {
          text: LookupSourceName.call(assessment, factor, model.getSourceType()),
          y: props.labelVerticalPosition,
          style: {
            color,
            fontSize,
            fontFamily,
          },
        },
        labels: {
          style: {
            color,
            fontSize,
            fontFamily,
          },
        },
      },
      pane: {
        size: props.speedometerSize,
        background: {
          backgroundColor: props.speedometerBackgroundColor,
        },
      },
      series: [{
        data: [_.round(series, 2)],
        dataLabels: {
          // eslint-disable-next-line max-len
          format: `<div style="text-align:center"><span style="font-size:${parseInt(fontSize, 10) * 3}%;color:${color}">{y}</span>`,
        },
      }],
    }))
  }

  renderCharts () {
    const { model } = this.props
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) { return null }

    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const data = Series[sourceType]
    if (!data) { return null }
    _.each(sourceModel, (factor) => {
      this.renderChart(factor)
    })
  }

  render () {
    const { model } = this.props
    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const cssStyles = {
      height: `${100 / Math.ceil(_.result(sourceModel, 'length', 0) / 2)}%`,
    }
    return (
      <div className={styles.gauge}>
        {['Factor', 'ExternalFactor', 'DataSheet'].includes(sourceType) && sourceModel
          && _.map(sourceModel, (factor, i) => (
            <div style={cssStyles} key={i} className={styles.chartContainer} ref={(ref) => { this.container = ref }} />
          ))}
      </div>
    )
  }
}

export default Gauge
