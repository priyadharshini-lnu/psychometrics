import _ from 'lodash'

export default function ChartOptions (model) {
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
    colors: _.map(model.props.colors, 'color'),
    credits: {
      enabled: false,
    },
    title: false,
    tooltip: false,
    xAxis: _.merge(xAxisOptions, {
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
      title: false,
    },
    legend: {
      reversed: true,
      itemStyle: {
        fontSize: fontSize || '11px',
        color: color || '#000',
        fontFamily,
      },
    },
  }
}
