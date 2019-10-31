import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Foundation from 'rb/components/Foundation'
import ConditionImageStore from 'rb/store/modals/ConditionImageStore'
import styles from './Image.scss'

export class Image extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
  }

  load = () => {
    this.forceUpdate()
  }

  openEditor = () => {
    const { module: model, preview } = this.props
    if (!preview && model.props.sourceType === 'ConditionalImage') {
      ConditionImageStore.open(model)
    }
  }

  renderImg () {
    const { module: model, preview } = this.props
    if (model.props.url) {
      return (
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${model.props.url})` }}
          onLoad={this.load}
          onDoubleClick={this.openEditor}
        />
      )
    } if (preview && model.props.sourceType === 'ConditionalImage') {
      return (
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${ConditionImageStore.getImageUrl(model)})` }}
          onLoad={this.load}
        />
      )
    }
    return (this.renderText())
  }

  renderText () {
    return (
      <div className={styles.image} onDoubleClick={this.openEditor}>
        <span>Image</span>
      </div>
    )
  }

  render () {
    return (
      <Foundation {...this.props} aspectRatio={false}>
        {this.renderImg()}
      </Foundation>
    )
  }
}

export default Image
