import { Options, AxisLabelsFormatterContextObject } from 'highcharts'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { getBarPaletteColors } from './barGradient'

type changeLabelFun = (labelObj: AxisLabelsFormatterContextObject) => void

export default function ChartOptions (
  { ...model }: PropertiesModel,
  animation: boolean,
  format: string,
  changeLabel: changeLabelFun,
): Options {
  const { fontSize, fontColor: color, fontFamily } = model.props.style
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
  const borderRadius = {
    where: (model.props.barBorderRadiusType ? 'all' : 'end') as 'all' | 'end',
    radius: model.props.barBorderRadius || 0,
    scope: 'point' as ('point' | 'stack'),
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
    colors: getBarPaletteColors(model),
    credits: { enabled: false },
    xAxis: {
      ...xAxisOptions,
      type: 'category',
      tickInterval: model.props.xAxisInterval ? parseInt(model.props.xAxisInterval, 10) : undefined,
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
      tickInterval: model.props.yAxisInterval ? parseInt(model.props.yAxisInterval, 10) : undefined,
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
        enabled: !model.props.yAxisLabelHide,
      },
    },
    plotOptions: {
      series: {
        animation,
        borderWidth: 0,
        dataLabels: {
          style: {
            fontWeight: 'normal',
            fontSize: fontSize || '11px',
            color: color || '#000',
            fontFamily,
          },
          enabled: !!model.propsshowValues,
          format,
        },
      },
      bar: {
        borderRadius,
      },
      column: {
        borderRadius,
      },
    },
    tooltip: {
      enabled: animation,
      headerFormat: '<hr/><b>{series.name}</b><br/>',
      pointFormat: '{point.y}<br/>{point.custom.description}',
    },
  }
}
