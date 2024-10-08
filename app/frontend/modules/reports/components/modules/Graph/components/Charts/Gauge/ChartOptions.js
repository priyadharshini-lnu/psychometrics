import _ from 'lodash'

export default function ChartOptions (model) {
  return {
    chart: {
      type: 'solidgauge',
      backgroundColor: model.props.transparentBackground ? 'transparent' : '#ffffff',
    },
    accessibility: {
      enabled: false,
    },
    title: false,
    tooltip: {
      enabled: false,
    },
    yAxis: {
      min: 0,
      max: model.props.maxValue || 6,
      lineWidth: 0,
      tickWidth: 0,
      tickAmount: 0,
      tickInterval: model.props.hideMarkers ? 0 : Math.round(model.props.maxValue / 6),
      // eslint-disable-next-line no-nested-ternary
      tickPositions: model.props.hideMarkers ? '' : model.props.maxValue > 12
        ? [..._.times(Math.round(model.props.maxValue / 6), i => i * 6), model.props.maxValue || 6]
        : [..._.times(Math.round(model.props.maxValue), i => i), model.props.maxValue || 6],
      labels: {
        y: 16,
      },
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          borderWidth: 0,
          useHTML: true,
        },
        rounded: true,
      },
    },
    pane: {
      center: ['50%', '85%'],
      startAngle: -90,
      endAngle: 90,
      background: {
        innerRadius: '66%',
        outerRadius: '95%',
        shape: 'arc',
        borderWidth: model.props.gaugeBorder,
      },
    },
  }
}
