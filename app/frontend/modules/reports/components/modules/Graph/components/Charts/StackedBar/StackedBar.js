import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import AppStore from 'rb/store/AppStore'
import LookupSourceName from 'rb/commands/LookupSourceName'
import styles from './StackedBar.scss'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'

class StackedBar extends Component {
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
    const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat)
    if (!series.length) { return null }
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    this.chart = Highcharts.chart(this.container,
      _.merge(ChartOptions(model, e => this.changeBarLabel(data.collection, e), this.props),
        {
          chart: {
            type: model.props.graphicalPosition === 'Vertical' ? 'column' : 'bar',
          },
          plotOptions: {
            series: {
              stacking: 'normal',
              animation,
              dataLabels: {
                enabled: !!model.props.showValues,
                format: '{point.y:.1f}%',
              },
            },
          },
          series: _.map(series, (ser, i) => ({
            name: LookupSourceName.call(assessment, sourceModel[i], model.getSourceType()),
            data: [ser.to - ser.from],
            pointWidth: model.props.pointWidth,
          })),
        }))
  }

  render () {
    return (
      <div ref={(ref) => { this.container = ref }} className={styles.chart} />
    )
  }
}

export default StackedBar
