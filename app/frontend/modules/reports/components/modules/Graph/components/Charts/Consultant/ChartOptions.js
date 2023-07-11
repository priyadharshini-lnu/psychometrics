export default function ChartOptions (model, animation) {
  return {
    chart: {
      backgroundColor: model.props.transparentBackground ? 'transparent' : '#ffffff',
      height: model.props.position.height,
      polar: true,
    },
    accessibility: {
      enabled: false,
    },
    title: false,
    pane: {
      startAngle: 0,
      endAngle: 360,
    },
    yAxis: {
      tickInterval: 1,
      min: 0,
      max: 7,
      labels: {
        enabled: false,
      },
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      enabled: animation,
      headerFormat: '<hr/><b>{series.name}</b><br/>',
      pointFormat: '{point.y}<br/>{point.custom.description}',
    },
  }
}
