export default function ChartOptions () {
  return {
    chart: {
      type: 'solidgauge',
    },
    title: false,
    tooltip: false,
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickPositions: [],
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          enabled: false,
        },
        linecap: 'round',
        stickyTracking: false,
      },
    },
  }
}
