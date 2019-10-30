import _ from 'lodash'

export default function ChartOptions (model) {
  return {
    colors: _.map(model.props.colors, 'color'),
    chart: {
      polar: true,
      type: 'line',
    },
    legend: {
      enabled: true,
    },

    credits: {
      enabled: false,
    },
    title: false,
    pane: {
      size: '80%',
    },
    tooltip: false,

  }
}
