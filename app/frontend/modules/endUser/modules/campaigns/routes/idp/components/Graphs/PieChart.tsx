import _ from 'lodash'
import { FC, useMemo, useContext } from 'react'
import HighCharts, { SeriesPieOptions } from 'highcharts'
import { HighChartContainer, MediaQueryContext } from '~/glint'
import { defaultPieChartOptions } from './chartOptions'

type chartSeriesDataType = {
  label: string,
  value: number,
}

type Props = {
  chartSeriesData: chartSeriesDataType[],
  colors: string[],
  title: string
}

const { I18n } = window

export const PieChart:FC<Props> = ({ chartSeriesData, colors, title }) => {
  const { isMobile } = useContext(MediaQueryContext)
  const data = useMemo(() => chartSeriesData.map(({ label, value }) => ({ name: label, y: value })), [chartSeriesData])
  const chartSeries: SeriesPieOptions[] = [{
    type: 'pie',
    name: I18n.t('idp.my_plan.graphs.categories'),
    data,
  }]
  const chartDimensionOptions = isMobile ? {} : { width: 400, height: 300 }
  const chartOptions:HighCharts.Options = _.merge({},
    defaultPieChartOptions, {
      series: chartSeries, colors, title: { text: title }, chart: chartDimensionOptions,
    })

  return (
    <HighChartContainer chartOptions={chartOptions} />
  )
}
