import { Options } from 'highcharts'
import { Stats } from '~/modules/admin/modules/campaigns/core/stats'

const { I18n } = window

export const COLORS = {
  not_started: '#009EA7',
  in_progress: '#E89F0F',
  completed: '#2ED100',
  ineligible: '#8C8C8C',
  interrupted: '#E89F0F',
  timed_out: 'red',
}

export const buildHighchartOptions = (timeseries: Stats['timeseries']): Options => ({
  title: {
    text: '',
  },
  credits: { enabled: false },
  chart: {
    zooming: {
      type: 'x',
    },
  },
  tooltip: {
    enabled: false,
  },
  xAxis: {
    type: 'datetime',
    // https://api.highcharts.com/highcharts/xAxis.dateTimeLabelFormats
    dateTimeLabelFormats: {
      day: '%Y, %b %e',
    },
  },
  yAxis: {
    title: {
      text: I18n.t('administration.stats.users.y_title'),
    },
    minTickInterval: 1,
  },

  legend: {
    layout: 'horizontal',
    align: 'left',
    verticalAlign: 'top',
  },

  plotOptions: {
    series: {
      label: {
        connectorAllowed: false,
      },
      animation: false,
      pointStart: new Date(timeseries[0].dt).getTime(),
      pointInterval: 3600 * 1000 * 24,
    },
  },

  series: [{
    name: 'In Progress',
    color: COLORS.in_progress,
    type: 'line',
    data: timeseries.map(t => t.started),
  }, {
    name: 'Completed',
    color: COLORS.completed,
    type: 'line',
    data: timeseries.map(t => t.completed),
  }],

  responsive: {
    rules: [{
      condition: {
        maxWidth: 500,
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
        },
      },
    }],
  },

})
