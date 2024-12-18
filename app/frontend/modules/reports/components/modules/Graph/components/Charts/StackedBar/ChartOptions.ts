import merge from 'lodash/merge'
import { Options } from 'highcharts'

import { PropertiesModel } from '~/modules/reports/interfaces/graphs/StackedBar'

export default function ChartOptions (model: PropertiesModel, animation: boolean, rtl = false): Options {
  const { fontSize, fontColor: color, fontFamily } = model.props.style
  const [...colorsObjectList] = model.props.colors
  let xAxisOptions = {}
  if (model.props.xAxisLinesHide) {
    xAxisOptions = {
      lineWidth: 0,
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,
    }
  }
  return {
    chart: {
      backgroundColor: model.props.transparentBackground ? 'transparent' : '#ffffff',
    },
    accessibility: {
      enabled: false,
    },
    colors: colorsObjectList.map(colorObj => colorObj.color),
    credits: {
      enabled: false,
    },
    title: {
      text: '',
    },
    xAxis: merge(xAxisOptions, {
      labels: {
        style: {
          fontSize: fontSize || '11px',
          color: color || '#000',
          fontFamily,
        },
      },
      categories: [''],
    }),
    yAxis: {
      gridLineWidth: model.props.yAxisLinesHide ? 0 : 1,
      labels: {
        style: {
          fontSize: fontSize || '11px',
          color: color || '#000',
          fontFamily,
        },
      },
      min: 0,
      max: 100,
      title: {
        text: '',
      },
    },
    legend: {
      reversed: true,
      itemStyle: {
        fontSize: fontSize || '11px',
        color: color || '#000',
        fontFamily,
      },
      rtl,
    },
    tooltip: {
      enabled: animation,
      headerFormat: '<hr/><b>{series.name}</b><br/>',
      pointFormat: '{point.y}<br/>{point.custom.description}',
    },
  }
}
