import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from '~/modules/reports/store/AppStore'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'
import styles from './Gauge.less'
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
    const { model, animation, colorOverrides } = this.props
    const { fontSize, fontColor: color, fontFamily } = model.props.style
    const data = Series[model.getSourceType()]
    const series = data.series(getCorrectResults(model), factor, model)
    const { props } = model
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    Highcharts.chart(this[`container${factor.id || factor}`], Highcharts.merge(ChartOptions(model), {
      plotOptions: {
        series: {
          colors: colorOverrides ? _.map(colorOverrides, 'color') : [props.speedometerMainColor],
          animation,
          borderRadius: model.props.rounded ? '100%' : '0%',
        },
      },
      yAxis: {
        title: {
          text: model.props.hideLabel ? '' : LookupSourceName.call(assessment, factor, model.getSourceType()),
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
        data: model.props.gaugePercentage
          ? [_.round((series / (model.props.maxValue || 6)) * 100, model.props.precision ?? 2)]
          : [_.round(series, model.props.precision ?? 2)],
        radius: `${95 - ((100 - model.props.gaugeWidth ?? 70) / 100 * 29) / 2}%`,
        innerRadius: `${66 + ((100 - model.props.gaugeWidth ?? 70) / 100 * 29) / 2}%`,
        dataLabels: {
          // eslint-disable-next-line max-len
          format: `<div style="text-align:center"><span style="font-size:${parseInt(fontSize, 10) * 3}%;color:${color}">{y}${model.props.gaugePercentage ? '%' : ''}</span>`,
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
        {['Factor',
          'ExternalFactor',
          'DataSheet',
          'CampaignFactors',
          'SavilleFactor'].includes(sourceType) && sourceModel
          && _.map(sourceModel, (factor, i) => (
            <div
              style={cssStyles}
              key={i}
              className={styles.chartContainer}
              ref={(ref) => { this[`container${factor.id || factor}`] = ref }}
            />
          ))}
      </div>
    )
  }
}

export default Gauge
