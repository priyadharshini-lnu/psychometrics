import { Dayjs } from 'dayjs'
import { Options } from 'highcharts'
import { Stats } from '~/modules/admin/modules/campaigns/core/stats'

const { I18n } = window

export const COLORS = {
  not_started: '#04717B',
  in_progress: '#E89F0F',
  completed: '#2ED100',
  ineligible: '#8C8C8C',
  interrupted: '#E89F0F',
  timed_out: 'red',
}

export const buildHighchartOptions = (
  timeseries: Stats['timeseries'], pointStart: Dayjs, pointEnd: Dayjs,
): Options => {
  const pointInterval = pointEnd.diff(pointStart, 'days') >= 1 ? 3600 * 1000 * 24 : 3600 * 1000

  return {
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
        text: I18n.t('admin.stats_users_y_title'),
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
        pointStart: pointStart.unix() * 1000,
        pointInterval,
      },
    },

    series: [{
      name: I18n.t('campaign_assessment.statuses.in_progress'),
      color: COLORS.in_progress,
      type: 'line',
      data: timeseries.map(t => t.started),
    }, {
      name: I18n.t('campaign_assessment.statuses.completed'),
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
  }
}
