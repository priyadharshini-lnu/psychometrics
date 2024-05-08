import _ from 'lodash'
import { FC } from 'react'
import Highcharts from 'highcharts'
import { HighChartContainer } from '~/glint'
import { defaultKpiChartOptions } from './chartOptions'

type chartSeriesDataType = {
  label: string,
  value: number,
}

type Props = {
  chartSeriesData: {
    behavioural: chartSeriesDataType,
    technical: chartSeriesDataType,
    other: chartSeriesDataType,
  },
  colors: string[],
  title: string,
}

const chartRadii = {
  behavioural: {
    outer: '80%',
    inner: '65%',
  },
  technical: {
    outer: '64%',
    inner: '50%',
  },
  other: {
    outer: '49%',
    inner: '35%',
  },
}


export const KpiChart:FC<Props> = ({ chartSeriesData, colors, title }) => {
  const trackColors = colors.map(color => new Highcharts.Color(color).setOpacity(0.3).get())
  const paneOptions = {
    startAngle: 0,
    endAngle: 360,
    background: [{
      outerRadius: chartRadii.behavioural.outer,
      innerRadius: chartRadii.behavioural.inner,
      backgroundColor: trackColors[0],
      borderWidth: 0,
    }, {
      outerRadius: chartRadii.technical.outer,
      innerRadius: chartRadii.technical.inner,
      backgroundColor: trackColors[1],
      borderWidth: 0,
    }, {
      outerRadius: chartRadii.other.outer,
      innerRadius: chartRadii.other.inner,
      backgroundColor: trackColors[2],
      borderWidth: 0,
    }],
  }

  const seriesOptions = [{
    name: chartSeriesData.behavioural.label,
    data: [{
      color: colors[0],
      radius: chartRadii.behavioural.outer,
      innerRadius: chartRadii.behavioural.inner,
      y: chartSeriesData.behavioural.value,
    }],
  }, {
    name: chartSeriesData.technical.label,
    data: [{
      color: colors[1],
      radius: chartRadii.technical.outer,
      innerRadius: chartRadii.technical.inner,
      y: chartSeriesData.technical.value,
    }],
  }, {
    name: chartSeriesData.other.label,
    data: [{
      color: colors[2],
      radius: chartRadii.other.outer,
      innerRadius: chartRadii.other.inner,
      y: chartSeriesData.other.value,
    }],
  }]

  const chartOptions = _.merge({},
    defaultKpiChartOptions, {
      series: seriesOptions, pane: paneOptions, colors, title: { text: title },
    })

  const renderIcons = (chart) => {
    chart.series.forEach((series) => {
      if (!series.icon) {
        series.icon = chart.renderer
          .text(
            '<i class="fa fa-arrow-right"></i>',
            0,
            0,
            true,
          )
          .css({
            color: '#FFF',
            fontSize: '10px',
          })
          .add(chart.series[2].group)
      }
      series.icon.attr({
        x: chart.chartWidth / 2 - 4,
        y: chart.plotHeight / 2
                  - series.points[0].shapeArgs.innerR
                  - (
                    series.points[0].shapeArgs.r
                      - series.points[0].shapeArgs.innerR
                  ) / 2
                  + 5,
      })
    })
  }

  return (
    <HighChartContainer onChartLoad={chart => renderIcons(chart)} chartOptions={chartOptions as Highcharts.Options} />
  )
}
