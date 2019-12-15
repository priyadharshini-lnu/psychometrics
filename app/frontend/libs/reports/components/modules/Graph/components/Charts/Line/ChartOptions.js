import _ from 'lodash'

export default function ChartOptions (model) {
  return {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'line',
      height: model.props.position.height,
    },
    title: false,
    subtitle: false,
    colors: _.map(model.props.colors, 'color'),
    credits: { enabled: false },
    tooltip: {
      enabled: false,
    },
  }
}
