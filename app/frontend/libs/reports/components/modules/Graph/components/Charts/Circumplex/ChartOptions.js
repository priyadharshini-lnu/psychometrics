export default function ChartOptions () {
  return {
    chart: {
      polar: true,
    },
    title: false,
    pane: {
      startAngle: 0,
      endAngle: 360,
    },
    tooltip: {
      enabled: false,
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
  }
}
