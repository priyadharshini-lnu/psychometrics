import _ from 'lodash'

export default function ChartOptions (model, animation, rtl) {
  return {
    colors: _.map(model.props.colors, 'color'),
    chart: {
      polar: true,
      type: 'line',
      backgroundColor: model.props.transparentBackground ? 'transparent' : '#ffffff',
    },
    accessibility: {
      enabled: false,
    },
    legend: {
      enabled: true,
      rtl,
    },
    credits: {
      enabled: false,
    },
    title: false,
    pane: {
      size: '80%',
    },
    tooltip: {
      enabled: animation,
      headerFormat: '<hr/><b>{series.name}</b><br/>',
      pointFormat: '{point.y}<br/>{point.custom.description}',
    },
  }
}
