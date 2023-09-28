import _ from 'lodash'

export default function ChartOptions ({ ...model }, animation) {
  return {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'line',
      height: model.props.position.height,
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
      headerFormat: '',
      pointFormat: '<hr/><b>{point.name}</b><br/>{point.y}<br/>{point.custom.description}',
    },
  }
}
