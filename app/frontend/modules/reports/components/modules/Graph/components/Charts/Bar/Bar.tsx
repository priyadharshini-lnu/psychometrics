import merge from 'lodash/merge'
import React, { useEffect, useRef } from 'react'
import Highcharts, { Chart, AxisLabelsFormatterContextObject } from 'highcharts'
import Highcharts3D from 'highcharts/highcharts-3d'
import CustomEvents from 'highcharts-custom-events'
import _ from 'lodash'
import cs from 'classnames'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { Factor } from '~/modules/reports/interfaces/Base'
import { SourceModel } from '~/modules/reports/interfaces/graphs/Base'
import Utils from '~/modules/reports/utils/Utils'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'
import styles from './styles.less'

Highcharts3D(Highcharts)
CustomEvents(Highcharts)

const Formats = {
  Count: precision => (_.isNil(precision) ? '{point.y}' : `{point.y:.${precision}f}`),
  Mean: precision => (_.isNil(precision) ? '{point.y:.1f}' : `{point.y:.${precision}f}`),
  Percentile: precision => (_.isNil(precision) ? '{point.y:.1f}%' : `{point.y:.${precision}f}%`),
}

interface Props {
  model: PropertiesModel
  animation?: boolean
  factors: Factor[]
  isRTL: boolean
}

export const Bar: React.FC<Props> = ({
  factors, model, isRTL, animation = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()

  useEffect(() => {
    renderChart()
  })

  useEffect(
    () => () => {
      chartRef.current && chartRef.current.destroy()
    },
    [],
  )

  const get3DOptions = () => {
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

  const changeBarLabel = (collectionName: string, labelObj: AxisLabelsFormatterContextObject) => {
    changeLabel(model, labelObj.value, collectionName)
  }

  const checkAndFilterValues = (results) => {
    results.forEach((result) => {
      if (!result.data) { return }
      if (model.props.hideEmptyColumns === true) {
        result.data = Utils.filterItemsWithEmptyValues(result.data, 'y')
      }
      if (model.props.hideZeroValueColumns === true) {
        result.data = Utils.filterItemsWithZeroValues(result.data, 'y')
      }
    })
    return results
  }

  const renderChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = undefined
    }
    if (!model.props.source) {
      return null
    }

    const sourceType = model.getSourceType()
    const sourceModel: SourceModel = model.getSourceModel()
    if (sourceType === 'EmbeddedData' && !sourceModel.name) {
      return null
    }
    const data = Series[sourceType]
    if (!data) {
      return null
    }
    const series = checkAndFilterValues(
      data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat, factors),
    )

    let reversedX = false
    let reversedY = false
    let oppositeY = false
    let oppositeX = false
    if (model.props.graphicalPosition === 'Horizontal' && model.props.reverse && !isRTL) {
      reversedX = true
      reversedY = true
      oppositeX = true
      oppositeY = false
    } else if (model.props.graphicalPosition === 'Horizontal' && model.props.reverse && isRTL) {
      reversedX = true
      oppositeY = false
      oppositeX = false
      reversedY = false
    } else if (model.props.graphicalPosition === 'Horizontal' && !model.props.reverse && isRTL) {
      reversedX = false
      reversedY = true
      oppositeX = true
      oppositeY = false
    } else if (model.props.graphicalPosition === 'Vertical' && !model.props.reverse && isRTL) {
      reversedX = true
      oppositeY = true
    } else {
      reversedX = false
      reversedY = false
      oppositeY = false
      oppositeX = false
    }

    const format = data.format
      ? data.format(model.props.dataFormat)
      : Formats[model.props.dataFormat](model.props.precision)

    if (!series.length) {
      return null
    }
    let legendVerticalPosition = 'Bottom'
    let legendHorizontalPosition = 'Middle'
    if (model.props.legendPosition) {
      [legendVerticalPosition, legendHorizontalPosition] = model.props.legendPosition.split(' ')
    }
    if (legendHorizontalPosition === 'Middle') {
      legendHorizontalPosition = 'Center'
    }
    chartRef.current = containerRef.current ? Highcharts.chart(
      containerRef.current,
      merge(
        ChartOptions(model, animation, format, labelObj => changeBarLabel(data.collection, labelObj)),
        {
          chart: {
            type: model.props.graphicalPosition === 'Vertical' ? 'column' : 'bar',
            options3d: get3DOptions(),
            animation,
            rtl: isRTL,
          },
          animation,
          legend: {
            enabled: model.props.showLegend,
            align: legendHorizontalPosition.toLowerCase(),
            verticalAlign: legendVerticalPosition.toLowerCase(),
            rtl: isRTL,
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
          xAxis: {
            reversed: reversedX,
            opposite: oppositeX,
          },
          yAxis: {
            reversed: reversedY,
            opposite: oppositeY,
          },
          series,
        },
      ),
    ) : undefined
    return null
  }

  const rounded = model.props.barBorderRadiusType && model.props.yAxisLinesHide

  return <div ref={containerRef} className={cs(styles.graph, { [styles.rounded]: rounded })} />
}
