import React, { FC, useEffect, useRef } from 'react'
import Highcharts, { Chart } from 'highcharts-v9'
import highChartMore from 'highcharts-v9/highcharts-more'
import merge from 'lodash/merge'

import { getCorrectResults } from '../ResultManager'
import { createFactorSeries, getFactorValue } from './series/factors'
import {
  defaultChartOptions,
  additionalChartOptions,
  ChartOptions,
} from './chartOptions'

import { SeriesDataIdPoint, ColorsFromPallet } from './interfaces/graph'

highChartMore(Highcharts)

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
}

const Bubble: FC<Props> = ({ model }) => {
  const chartContainer = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()

  useEffect(() => {
    if (!chartContainer.current) {
      return
    }

    const chartOptions = getBubbleChartOptions(model)
    if (chartRef.current) {
      chartRef.current.update(chartOptions, true, true, false)
    } else {
      chartRef.current = Highcharts.chart(chartContainer.current, chartOptions)
    }
  })

  useEffect(
    () => () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = undefined
      }
    },
    [],
  )

  return <div className="h-100 w-100" ref={chartContainer} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getBubbleChartOptions = (model: any): ChartOptions => {
  const {
    source,
    seriesValueIds,
    xMeanTitle,
    xMeanValueId,
    yMeanTitle,
    yMeanValueId,
    transparentBackground = false,
    colors: chartColors,
  } = model.props

  if (!source) {
    return defaultChartOptions
  }

  const sourceType = model.getSourceType()

  if (!['Factor', 'DataSheet', 'EmbeddedData'].includes(sourceType)) {
    return defaultChartOptions
  }

  const backgroundColor = transparentBackground ? 'transparent' : '#ffffff'

  let colors: string[] = []
  if (chartColors && chartColors.length !== 0) {
    colors = chartColors
      .sort(
        (colorA: ColorsFromPallet, colorB: ColorsFromPallet) => colorA.id - colorB.id,
      )
      .map((color: ColorsFromPallet) => color.color)
  }

  let updatedChartOptions: ChartOptions = defaultChartOptions
  let seriesData: SeriesDataIdPoint[] = []

  const correctedResults = getCorrectResults(model)
  if (sourceType === 'Factor') {
    seriesData = createFactorSeries(correctedResults, seriesValueIds)

    updatedChartOptions = additionalChartOptions({
      backgroundColor,
      xMeanTitle,
      xMean: getFactorValue(correctedResults, xMeanValueId),
      yMeanTitle,
      yMean: getFactorValue(correctedResults, yMeanValueId),
      colors,
    })
  }

  const configChartOptions = merge(defaultChartOptions, updatedChartOptions)
  const chartOptions: ChartOptions = {
    ...configChartOptions,
    series: [
      { type: 'bubble', states: { hover: undefined }, data: seriesData },
    ],
  }

  return chartOptions
}

export default Bubble
