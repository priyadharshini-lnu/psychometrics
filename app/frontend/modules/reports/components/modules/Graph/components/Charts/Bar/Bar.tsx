import merge from 'lodash/merge'
import React, { useEffect, useRef } from 'react'
import Highcharts, { Chart, AxisLabelsFormatterContextObject } from 'highcharts-v9'
import Highcharts3D from 'highcharts-v9/highcharts-3d'
import CustomEvents from 'highcharts-custom-events'

import { PropertiesModel } from 'modules/reports/interfaces/graphs/Bar'
import { SourceModel } from 'modules/reports/interfaces/graphs/Base'
import Utils from 'modules/reports/utils/Utils'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'

import styles from './styles.less'

Highcharts3D(Highcharts)
CustomEvents(Highcharts)

const Formats = {
  Count: '{point.y}',
  Mean: '{point.y:.1f}',
  Percentile: '{point.y:.1f}%',
}

interface Props {
  model: PropertiesModel
  animation?: boolean
}

export const Bar: React.FC<Props> = ({ model, animation = false }) => {
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

  const changeBarLabel = (collectionName: string, labelObj: AxisLabelsFormatterContextObject<string>) => {
    changeLabel(model, labelObj.value, collectionName)
  }

  const checkAndFilterEmptyValues = (results) => {
    if (model.props.hideEmptyColumns === true) {
      results.forEach((result) => {
        result.data = Utils.filterItemsWithEmptyValues(result.data, 'y')
      })
    }
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
    const series = checkAndFilterEmptyValues(
      data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat),
    )
    const format = data.format ? data.format(model.props.dataFormat) : Formats[model.props.dataFormat]
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
    ) : undefined
    return null
  }

  return <div ref={containerRef} className={styles.graph} />
}
