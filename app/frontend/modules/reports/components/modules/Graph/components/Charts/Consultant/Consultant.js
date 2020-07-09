import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from 'rb/store/AppStore'
import LookupSourceName from 'rb/commands/LookupSourceName'
import styles from './Consultant.scss'
import { changeLabel } from '../LabelChanger'
import ChartOptions from './ChartOptions'
import Series from './Series'
import { getCorrectResults } from '../ResultManager'

class Consultant extends Component {
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
    const colors = _.map(model.props.colors, 'color')
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) { return null }

    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    // find subfactors by factors
    if (!sourceModel || !sourceModel.length) { return null }

    const data = Series[sourceType]
    if (!data) { return null }
    const { fontSize, fontColor: color, fontFamily } = model.props.style
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const seriesData = _.map(sourceModel, (factor, i) => {
      const innerData = []
      _.times(i, () => {
        innerData.push({})
      })
      innerData.push({
        y: data.series(getCorrectResults(model), factor, model),
        color: colors[i],
      })
      const result = {
        type: 'column',
        name: LookupSourceName.call(assessment, factor, sourceType),
        color: colors[i],
        data: innerData,
      }
      return result
    })
    this.chart = Highcharts.chart(
      this.container,
      _.merge(
        ChartOptions(model, e => this.changeBarLabel(data.collection, e), this.props),
        {
          xAxis: {
            categories: _.map(sourceModel, factor => LookupSourceName.call(assessment, factor, sourceType)),
            tickInterval: 1,
            min: 0,
            max: sourceModel.length,
            labels: {
              style: {
                fontSize: fontSize || '11px',
                color: color || '#000',
                fontFamily,
              },
            },
          },
          yAxis: {
            min: 0,
            max: model.props.radarMax,
          },
          plotOptions: {
            series: {
              animation,
              stacking: 'normal',
              pointStart: 0,
              pointInterval: 1,
              dataLabels: {
                enabled: !!model.props.showValues,
                format: `{point.y:.${model.props.numberOfDecimals}f}`,
                padding: -20,
                style: {
                  fontSize: fontSize || '11px',
                  color: color || '#000',
                  fontFamily,
                },
              },
            },
            column: {
              pointPadding: 0,
              groupPadding: 0,
            },
          },
          legend: false,
          series: seriesData,
        },
      ),
    )
  }

  render () {
    return (
      <div ref={(ref) => { this.container = ref }} className={styles.chart} />
    )
  }
}

export default Consultant
