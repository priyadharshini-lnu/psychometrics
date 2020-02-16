import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from 'rb/store/AppStore'
import LookupSourceName from 'rb/commands/LookupSourceName'
import styles from './Radar.scss'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'

class Radar extends Component {
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
    const data = Series[sourceType]
    if (!data) { return null }
    const series = data.series(getCorrectResults(model), sourceModel, model)
    const { fontSize, fontColor: color, fontFamily } = model.props.style
    const format = null
    if (!series.length) { return null }
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    this.chart = Highcharts.chart(
      this.container,
      _.merge(
        ChartOptions(model, e => this.changeBarLabel(data.collection, e), this.props, format),
        {
          plotOptions: {
            series: {
              animation,
              dataLabels: {
                enabled: !!model.props.showValues,
                // eslint-disable-next-line object-shorthand
                formatter: function () {
                  return _.round(this.point.y, 2)
                },
                allowOverlap: true,
              },
            },
            line: {
              animation,
              marker: {
                enabled: false,
              },
            },
          },
          pane: {
            size: model.props.radarSize,
            startAngle: model.props.startAngle || 0,
          },
          xAxis: {
            categories: _.map(sourceModel, factor => LookupSourceName.call(assessment, factor, model.getSourceType())),
            tickmarkPlacement: 'on',
            lineWidth: 0,
            labels: {
              distance: 25,
              style: {
                color,
                fontSize,
                fontFamily,
              },
            },
          },
          yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            angle: -model.props.startAngle || 0,
            tickInterval: model.props.tickInterval,
            min: 0,
            max: model.props.radarMax,
            showLastLabel: true,
            labels: {
              x: -5,
              y: 7,
              overflow: 'allow',
              step: 1,
              style: {
                color,
                fontSize,
                fontFamily,
              },
            },
          },
          series,
        },
      ),
    )
  }

  render () {
    return (
      <div ref={(ref) => { this.container = ref }} className={styles.radar} />
    )
  }
}

export default Radar
