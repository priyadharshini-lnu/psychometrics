import { Options } from 'highcharts'

export const defaultPieChartOptions:Options = {
  credits: {
    enabled: false,
  },
  chart: {
    plotShadow: false,
    type: 'pie',
    // width: 400,
    // height: 300,
    margin: [0, 0, 0, 0],
  },
  title: {
    align: 'left',
    style: {
      fontSize: '14px',
    },
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
  },
  accessibility: {
    point: {
      valueSuffix: '%',
    },
  },
  plotOptions: {
    pie: {
      animation: false,
      allowPointSelect: true,
      cursor: 'pointer',
      center: ['50%', null],
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>',
      },
    },
  },
}

export const defaultKpiChartOptions: Options = {
  credits: {
    enabled: false,
  },
  chart: {
    plotShadow: false,
    type: 'solidgauge',
    width: 400,
    height: 300,
    margin: [0, 0, 0, 0],
  },
  yAxis: {
    min: 0,
    max: 100,
    lineWidth: 0,
    tickPositions: [],
  },
  title: {
    align: 'left',
    style: {
      fontSize: '14px',
    },
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
  },
  accessibility: {
    point: {
      valueSuffix: '%',
    },
  },
  plotOptions: {
    solidgauge: {
      animation: false,
      dataLabels: {
        enabled: false,
      },
      linecap: 'round',
      stickyTracking: false,
      rounded: true,
    },
  },
}
