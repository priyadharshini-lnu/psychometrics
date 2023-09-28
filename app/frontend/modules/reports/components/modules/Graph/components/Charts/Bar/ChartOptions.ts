import { Options, AxisLabelsFormatterContextObject } from 'highcharts'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'

type changeLabelFun = (labelObj: AxisLabelsFormatterContextObject) => void

export default function ChartOptions (
  { ...model }: PropertiesModel,
  animation: boolean,
  format: string,
  changeLabel: changeLabelFun,
): Options {
  const { fontSize, fontColor: color, fontFamily } = model.props.style
  const [...colorsObjectList] = model.props.colors
  const { type } = model.props.source
  const events = type === 'Question' ? {
    click () {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      changeLabel(this)
    },
  } : null

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
    accessibility: {
      enabled: false,
    },
    title: {
      text: '',
    },
    subtitle: {
      text: '',
    },
    colors: colorsObjectList.map(colorObj => colorObj.color),
    credits: { enabled: false },
    xAxis: {
      ...xAxisOptions,
      type: 'category',
      labels: {
        style: {
          fontSize: fontSize || '11px',
          color: color || '#000',
          fontFamily,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        events,
        enabled: !model.props.xAxisLabelHide,
      },
    },
    yAxis: {
      max: model.props.maxValue ? parseInt(model.props.maxValue, 10) : null,
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
        animation,
        borderWidth: 0,
        dataLabels: {
          enabled: !!model.propsshowValues,
          format,
        },
      },
      bar: {
        borderRadius: model.props.barBorderRadius || 0,
      },
      column: {
        borderRadius: model.props.barBorderRadius || 0,
      },
    },
    tooltip: {
      enabled: animation,
      headerFormat: '<hr/><b>{series.name}</b><br/>',
      pointFormat: '{point.y}<br/>{point.custom.description}',
    },
  }
}
