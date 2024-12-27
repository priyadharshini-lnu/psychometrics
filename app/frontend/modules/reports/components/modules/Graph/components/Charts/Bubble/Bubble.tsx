import {
  FC, useEffect, useRef, useState,
} from 'react'
import Highcharts, { Chart } from 'highcharts'
import highChartMore from 'highcharts/highcharts-more'
import _ from 'lodash'

import {
  PropertiesModel, SeriesDataIdPoint, ColorsFromPallet, Size,
} from '~/modules/reports/interfaces/graphs/Bubble'

import { getCorrectResults } from '../ResultManager'
import { createFactorSeries, getFactorValue } from './series/factors'
import {
  defaultChartOptions,
  additionalChartOptions,
  ChartOptions,
} from './chartOptions'

highChartMore(Highcharts)

interface Props {
  model: PropertiesModel,
  isRTL: boolean,
}

const Bubble: FC<Props> = ({ model, isRTL }) => {
  const chartContainer = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()
  const [plotSize, setPlotSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    if (!chartContainer.current) {
      return
    }
    const chartOptions = getBubbleChartOptions(model, plotSize, isRTL)
    if (chartRef.current) {
      chartRef.current.update(chartOptions, true, true, false)
    } else {
      chartRef.current = Highcharts.chart(chartContainer.current, chartOptions)
    }

    const size: Size = { width: chartRef.current.plotWidth, height: chartRef.current.plotHeight }
    if (!_.isEqual(size, plotSize)) {
      setPlotSize(size)
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

const getBubbleChartOptions = (model: PropertiesModel, size: Size, isRTL = false): ChartOptions => {
  const {
    source,
    seriesValueIds,
    xMeanTitle,
    xMeanValueId,
    yMeanTitle,
    yMeanValueId,
    xMin = 0,
    xMax = 100,
    yMin = 0,
    yMax = 100,
    bubbleSize,
    transparentBackground = false,
    colors: chartColors,
    showLegend = true,
    yAxisLabelDisabled = false,
    yAxisTitleDisabled = false,
    yAxisLinesHide = false,
  } = model.props

  const { fontSize: legendFontSize, fontColor: legendColor, fontFamily: legendFontFamily } = model.props.legendStyle

  if (!source) {
    return defaultChartOptions
  }

  const sourceType = model.getSourceType()

  if (!['Factor', 'DataSheet', 'CampaignFactors', 'EmbeddedData'].includes(sourceType)) {
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
  const usedFactorIds = _(seriesValueIds)
    .map(s => [s.x, s.y])
    .concat([xMeanValueId], [yMeanValueId])
    .flatten()
    .compact()
    .uniq()
    .value()
  const correctedResults = getCorrectResults(model, usedFactorIds)
  if (sourceType === 'Factor') {
    seriesData = createFactorSeries(correctedResults, seriesValueIds)

    updatedChartOptions = additionalChartOptions({
      backgroundColor,
      xMeanTitle,
      xMean: getFactorValue(correctedResults, xMeanValueId),
      yMeanTitle,
      yMean: getFactorValue(correctedResults, yMeanValueId),
      xMin,
      xMax,
      yMin,
      yMax,
      colors,
      size,
      bubbleSize,
      yAxisLabelDisabled,
      yAxisTitleDisabled,
      yAxisLinesHide,
    })
  }

  const configChartOptions = _.merge(defaultChartOptions, updatedChartOptions)
  const chartOptions: ChartOptions = {
    ...configChartOptions,
    legend: {
      enabled: showLegend,
      itemStyle: {
        color: legendColor,
        fontSize: legendFontSize || '10px',
        fontFamily: legendFontFamily,
      },
    },
    series: [
      { type: 'bubble', states: { hover: undefined }, data: seriesData },
    ],
    xAxis: {
      reversed: isRTL,
      lineWidth: model.props.xAxisLinesHide ? 0 : 1,
      ...configChartOptions.xAxis,
    },
    yAxis: {
      opposite: isRTL,
      lineWidth: model.props.yAxisLinesHide ? 0 : 1,
      ...configChartOptions.yAxis,
    },
  }

  return chartOptions
}

export default Bubble
