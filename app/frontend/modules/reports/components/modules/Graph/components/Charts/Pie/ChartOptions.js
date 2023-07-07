import _ from 'lodash'

export default function ChartOptions (model, animation) {
  return {
    chart: {
      backgroundColor: model.props.transparentBackground ? 'transparent' : '#ffffff',
    },
    accessibility: {
      enabled: false,
    },
    title: false,
    subtitle: false,
    colors: _.map(model.props.colors, 'color'),
    credits: { enabled: false },
    tooltip: {
      enabled: animation,
      headerFormat: '<hr/><b>{series.name}</b><br/>',
      pointFormat: '{point.y}<br/>{point.custom.description}',
    },
  }
}
