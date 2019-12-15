import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Foundation from 'rb/components/Foundation'
import styles from './Graph.scss'
import Charts from './Charts'

class Text extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    animation: PropTypes.bool,
    preview: PropTypes.bool,
  }

  renderGraph () {
    const { module: model, preview, animation } = this.props
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

export default Text
