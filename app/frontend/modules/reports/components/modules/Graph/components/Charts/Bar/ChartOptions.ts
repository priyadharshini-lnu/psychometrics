import merge from 'lodash/merge'
import { PropertiesModel } from 'modules/reports/interfaces/graphs/Bar'
import Highcharts from 'highcharts'

type Props = {
  model: PropertiesModel
  animation: boolean
}

type changeLabelFun = (e: Highcharts.Axis) => void

export default function ChartOptions (
  model: PropertiesModel,
  changeLabel: changeLabelFun,
  props: Props,
  format: string,
) {
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
      type: 'column',
      height: model.props.position.height,
      backgroundColor: model.props.transparentBackground ? 'transparent' : '#ffffff',
    },
    title: false,
    subtitle: false,
    colors: colorsObjectList.map(colorObj => colorObj.color),
    credits: { enabled: false },
    xAxis: merge(xAxisOptions, {
      type: 'category',
      labels: {
        style: {
          fontSize: fontSize || '11px',
          color: color || '#000',
          fontFamily,
        },
        events: {
          click (e) {
            e.stopPropagation()
            changeLabel(this)
          },
        },
        enabled: !model.props.xAxisLabelHide,
      },
    }),
    yAxis: {
      max: model.props.maxValue,
      gridLineWidth: model.props.yAxisLinesHide ? 0 : 1,
      title: {
        text: null,
      },
      labels: {
        style: {
          fontSize: fontSize || '11px',
          color: color || '#000',
          fontFamily,
        },
      },
    },
    plotOptions: {
      series: {
        animation: props.animation,
        borderWidth: 0,
        dataLabels: {
          enabled: !!model.propsshowValues,
          format,
        },
      },
    },
    tooltip: {
      enabled: false,
    },
  }
}
