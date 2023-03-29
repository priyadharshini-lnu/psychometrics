import merge from 'lodash/merge'
import React, { useEffect, useRef } from 'react'
import Highcharts, { Chart } from 'highcharts'

import AppStore from '~/modules/reports/store/AppStore'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'
import { Factor } from '~/modules/reports/interfaces/Base'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/StackedBar'
import { SourceModel } from '~/modules/reports/interfaces/graphs/Base'
import styles from './styles.less'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'

interface Props {
  model: PropertiesModel
  animation?: boolean
  factors: Factor[]
}

export const StackedBar: React.FC<Props> = ({ model, animation = false, factors }: Props) => {
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
    const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat, factors)
    if (!series.length) {
      return null
    }
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    chartRef.current = containerRef.current ? Highcharts.chart(
      containerRef.current,
      merge(ChartOptions(model, animation), {
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
          data: [{
            ...ser,
            y: ser.to - ser.from,
          }],
          pointWidth: model.props.pointWidth,
        })),
      }),
    ) : undefined
    return null
  }

  return <div ref={containerRef} className={styles.chart} />
}
