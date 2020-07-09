import _ from 'lodash'

export default function ChartOptions (model, changeLabel, props, format) {
  const { fontSize, fontColor: color, fontFamily } = model.props.style
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
    },
    title: false,
    subtitle: false,
    colors: _.map(model.props.colors, 'color'),
    credits: { enabled: false },
    xAxis: _.merge(xAxisOptions, {
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
