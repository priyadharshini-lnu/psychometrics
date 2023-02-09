import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Foundation from '~/modules/reports/components/Foundation'
import { getFlatFactors } from '~/modules/reports/core/builder/selectors'
import styles from './Graph.less'
import Charts from './Charts'

class Graph extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    animation: PropTypes.bool,
    preview: PropTypes.bool,
  }

  renderGraph () {
    const {
      factors, module: model, preview, animation,
    } = this.props
    if (model.textConditions.length > 0) {
      const {
        colors,
      } = model.getStylesByCondition()
      if (colors) model.props.colors = colors
    }
    if (model.props.type) {
      const View = Charts[model.props.type] || Charts.Bar
      return (
        <View
          factors={factors}
          model={model}
          preview={preview}
          animation={animation}
        />
      )
    }
    return 'Choose Graph Type'
  }

  render () {
    return (
      <Foundation {...this.props} aspectRatio={false}>
        <div className={styles.graph}>
          {this.renderGraph()}
        </div>
      </Foundation>
    )
  }
}

export default connect(
  state => ({
    factors: getFlatFactors(state),
  }),
  {},
)(Graph)
