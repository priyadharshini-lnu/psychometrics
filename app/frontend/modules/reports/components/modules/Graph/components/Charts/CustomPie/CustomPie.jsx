/* eslint-disable react/no-unescaped-entities */
import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from '~/modules/reports/store/AppStore'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'
import I18nStore from '~/modules/reports/store/I18nStore'
import styles from './CustomPie.less'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'
import { STRATEGIES } from './consts'

const OUTER_RADIUS = 112
const RADIUS_INTERVAL = 24
const SERIES_LIMIT = 4

const getFilterName = (filterId) => {
  const filter = _.find(AppStore.report.filters, { id: filterId })
  if (filter) return filter.name

  return filterId
}

const defineStrategy = (model, sources) => {
  if (model.props.filter && model.props.filter.length > 1 && sources.length > 1) {
    return STRATEGIES.ERROR
  }

  if (model.props.filter && model.props.filter.length > 1) {
    return STRATEGIES.FILTERS
  }

  return STRATEGIES.SOURCES
}

class CustomPie extends Component {
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

  getSourceModel () {
    const { model } = this.props
    const sourceModel = model.getSourceModel()
    // Up to 4 items can be supported
    return _.slice(sourceModel, 0, SERIES_LIMIT)
  }

  changeBarLabel = (collectionName, label) => {
    const { model } = this.props
    changeLabel(model, label.value, collectionName)
  }

  prepareSerie (name, color, y, index, description) {
    return {
      name,
      marker: { enabled: false },
      borderColor: color,
      color,
      data: [
        {
          color,
          radius: `${100 - 25 * index}%`,
          innerRadius: `${100 - 25 * index}%`,
          y,
          custom: {
            description,
          },
        },
      ],
      showInLegend: true,
    }
  }

  prepareSeries (data, colors) {
    const { model, factors } = this.props
    const sourceType = model.getSourceType()
    const sourceModel = this.getSourceModel()
    const strategy = defineStrategy(model, sourceModel)
    const series = data.series(getCorrectResults(model), sourceModel, model, strategy)
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    if (strategy === STRATEGIES.SOURCES) {
      return sourceModel.map((factor, i) => this.prepareSerie(
        LookupSourceName.call(assessment, factor, sourceType), colors[i], series[i], i,
        sourceType === 'Factor' && I18nStore.tFactor(_.find(factors, { id: factor.id }), 'description'),
      ))
    }
    if (strategy === STRATEGIES.FILTERS) {
      return series.map(({ filterId, data }, i) => this.prepareSerie(getFilterName(filterId), colors[i], data[0], i))
    }
    return []
  }

  renderChart () {
    const { model, animation, isRTL } = this.props
    const colors = _.map(model.props.colors, 'color')
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
    if (!model.props.source) {
      return null
    }

    const sourceType = model.getSourceType()
    const sourceModel = this.getSourceModel()
    const data = Series[sourceType]
    if (!data) {
      return null
    }
    const series = this.prepareSeries(data, colors)
    if (!series.length) {
      return null
    }

    const { fontSize: legendFontSize, fontColor: legendColor, fontFamily: legendFontFamily } = model.props.legendStyle

    this.chart = Highcharts.chart(
      this.container,
      _.merge(ChartOptions(model, animation), {
        plotOptions: {
          solidgauge: {
            borderWidth: model.props.chartBorderWidth,
          },
          series: {
            animation,
          },
        },
        pane: {
          startAngle: isRTL ? 360 : 0,
          endAngle: isRTL ? 0 : 360,
          background: _.times(sourceModel.length, i => ({
            // Track for Move
            outerRadius: `${OUTER_RADIUS - RADIUS_INTERVAL * i - i}%`,
            innerRadius: `${OUTER_RADIUS - RADIUS_INTERVAL * (i + 1) - i}%`,
            backgroundColor: Highcharts.Color.parse(colors[i])
              .setOpacity(0.3)
              .get(),
            borderWidth: 0,
          })),
        },
        legend: {
          enabled: model.props.showLegend,
          itemStyle: {
            fontSize: legendFontSize || '10px',
            fontFamily: legendFontFamily,
          },
          labelFormatter () {
            return `<span style="text-weight:bold;color:${this.userOptions.color || legendColor}">${this.name}</span>`
          },
          symbolPadding: 0,
          symbolHeight: 0,
          symbolWidth: 0,
          rtl: isRTL,
        },
        series,
      }),
    )
  }

  render () {
    const { model } = this.props
    const strategy = defineStrategy(model, this.getSourceModel())
    if (strategy === STRATEGIES.ERROR) return <div>Multiple filter and factors can't be selected for pie chart</div>

    return <div ref={(ref) => { this.container = ref }} className={styles.chart} />
  }
}

export default CustomPie
