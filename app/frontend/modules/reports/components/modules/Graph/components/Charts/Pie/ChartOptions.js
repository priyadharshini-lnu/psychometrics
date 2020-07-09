import _ from 'lodash'

export default function ChartOptions (model) {
  return {
    title: false,
    subtitle: false,
    colors: _.map(model.props.colors, 'color'),
    credits: { enabled: false },
    tooltip: {
      enabled: false,
    },
  }
}
