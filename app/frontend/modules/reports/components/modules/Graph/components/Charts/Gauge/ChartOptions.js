import _ from 'lodash'

export default function ChartOptions (model) {
  const maxValue = model.props.gaugePercentage ? 100 : (model.props.maxValue || 6)
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
      max: maxValue,
      lineWidth: 0,
      tickWidth: 0,
      tickAmount: 0,
      tickInterval: model.props.hideMarkers ? 0 : Math.round(maxValue / 6),
      tickPositions: model.props.hideMarkers ? '' : [..._.times(Math.round(maxValue / 6), i => i * 6), maxValue],
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
        rounded: model.props.rounded,
      },
    },
    pane: {
      center: ['50%', '85%'],
      background: {
        innerRadius: '66%',
        outerRadius: '95%',
        shape: 'arc',
        borderWidth: model.props.gaugeBorder,
        borderColor: model.props.borderColor,
      },
    },
  }
}
