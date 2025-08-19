import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import styles from './Line.less'
import ChartOptions from './ChartOptions'
import Series from './Series'
import Utils from '~/modules/reports/utils/Utils'

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

  getCategoriesFromSeriesData = seriesData => seriesData.map(data => data.name)

  renderChart () {
    const {
      model, animation, factors, isRTL,
    } = this.props
    const { hideEmptyColumns, hideZeroValueColumns } = model.props

    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) { return null }

    const { fontSize: legendFontSize, fontColor: legendColor, fontFamily: legendFontFamily } = model.props.legendStyle

    const sourceType = model.getSourceType()
    const sourceModel = model.getSourceModel()
    const data = Series[sourceType]

    if (!data) { return null }
    if (sourceType === 'Question' && sourceModel.type === 'TextEntry') { return null }
    const series = Utils.checkAndFilterValues(
      { hideEmptyColumns, hideZeroValueColumns },
      data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat, factors),
    )
    const format = data.format ? data.format(model.props.dataFormat) : Formats[model.props.dataFormat]
    const labels = data.labels ? data.labels(sourceModel, model) : []
    let xAxis = _.invoke(data, 'xAxis', sourceModel, model, model.props.dataFormat, getCorrectResults(model)) || {}
    if ((hideEmptyColumns || hideZeroValueColumns) && series[0]) {
      xAxis.categories = this.getCategoriesFromSeriesData(series[0].data)
    }
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
      _.merge(ChartOptions(model, animation), {
        legend: {
          enabled: !!data.hasLegend && model.props.showLegend,
          itemStyle: {
            color: legendColor,
            fontSize: legendFontSize || '10px',
            fontFamily: legendFontFamily,
          },
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
          reversed: isRTL,
        }),
        yAxis: {
          gridLineWidth: model.props.yAxisLinesHide ? 0 : 1,
          title: { enabled: !model.props.yAxisTitleDisabled },
          labels: { enabled: !model.props.yAxisLabelDisabled },
          opposite: isRTL,
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
