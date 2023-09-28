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
      max: 6,
      lineWidth: 0,
      tickInterval: 6,
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
      },
    },
    pane: {
      center: ['50%', '85%'],
      startAngle: -90,
      endAngle: 90,
      background: {
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc',
      },
    },
  }
}
