import merge from 'lodash/merge'
import React, { useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import { Chart } from 'highcharts-v9'

import AppStore from 'modules/reports/store/AppStore'
import LookupSourceName from 'modules/reports/commands/LookupSourceName'
import { PropertiesModel } from 'modules/reports/interfaces/graphs/StackedBar'
import { SourceModel } from 'modules/reports/interfaces/graphs/Base'
import styles from './styles.scss'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'

interface Props {
  model: PropertiesModel
  animation?: boolean
}

export const StackedBar: React.FC<Props> = ({ model, animation = false }: Props) => {
  const containerRef: React.MutableRefObject<null> = useRef(null)
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
    const data = Series[sourceType]
    if (!data) {
      return null
    }
    const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat)
    if (!series.length) {
      return null
    }
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    chartRef.current = Highcharts.chart(
      containerRef.current,
      merge(ChartOptions(model), {
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
        series: series.map((ser, i) => ({
          name: LookupSourceName.call(assessment, sourceModel[i], model.getSourceType()),
          data: [ser.to - ser.from],
          pointWidth: model.props.pointWidth,
        })),
      }),
    )

    return null
  }

  return <div ref={containerRef} className={styles.chart} />
}
