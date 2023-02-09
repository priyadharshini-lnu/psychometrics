
import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Foundation from '~/modules/reports/components/Foundation'
import ResultStore from '~/modules/reports/store/ResultStore'
import GetImageURL from './GetImageURL'
import styles from './Image.less'

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
      const { openConditionalImage } = this.props
      openConditionalImage({ model })
    }
  }

  renderImg () {
    const { module: model, preview } = this.props
    if (model.props.url) {
      return (
        <div
          className={styles.image}
          style={{ backgroundImage: `url("${model.props.url}")` }}
          onDoubleClick={this.openEditor}
        />
      )
    } if (preview && model.props.sourceType === 'ConditionalImage') {
      return (
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${GetImageURL.run(model)})` }}
        />
      )
    }
    if (preview && model.props.sourceType === 'ResponseImage') {
      const result = ResultStore.results[model.assessment_id]
      if (!result) { return this.renderText() }

      const mediaResponse = _.find(result.mediaResponses, mr => mr.question_id === model.props.sourceQuestion)
      if (!mediaResponse) { return this.renderText() }
      return (
        <img
          className={`${styles.image} ${styles.responseImage}`}
          src={mediaResponse.url}
          style={{
            maxWidth: model.props.position.width,
            maxHeight: model.props.position.height,
          }}
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
