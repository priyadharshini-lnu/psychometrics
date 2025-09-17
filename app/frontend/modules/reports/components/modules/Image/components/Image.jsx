
import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Foundation from '~/modules/reports/components/Foundation'
import ResultStore from '~/modules/reports/store/ResultStore'
import GetImageURL from './GetImageURL'
import I18nStore from '~/modules/reports/store/I18nStore'
import styles from './Image.less'
import { joinStyles, useAssignStyle, convertColor } from '../../CommonMethods/styles'

const assignStyle = useAssignStyle('Image')

export class Image extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
  }

  state = {
    imageError: false,
  }

  load = () => {
    this.forceUpdate()
  }

  handleImageError = () => {
    this.setState({ imageError: true })
  }

  openEditor = () => {
    const { module: model, preview } = this.props
    if (!preview && model.props.sourceType === 'ConditionalImage') {
      const { openConditionalImage } = this.props
      openConditionalImage({ model })
    }
  }

  renderImg (flipContent) {
    const { module: model, preview } = this.props
    const { imageError } = this.state

    const style = this.buildStyles(flipContent)

    if (preview && model.props.sourceType === 'UserProfileImage') {
      const { user } = ResultStore
      return (
        <img
          className={`${styles.image} ${styles.responseImage}`}
          src={user?.photo}
          style={{
            maxWidth: model.props.position.width,
            maxHeight: model.props.position.height,
            ...style,
          }}
          onLoad={this.load}
        />
      )
    }
    if (model.props.url) {
      const imageUrl = I18nStore.tModule(model, 'imageUrl') || model.props.url
      return (
        <>
          {!imageError && (
            <img
              src={imageUrl}
              style={{ display: 'none' }}
              onError={this.handleImageError}
            />
          )}
          {imageError && (
            <div className={styles.brokenImage}>
              {I18n.t('administration.reports.broken_image_url')}
            </div>
          )}
          <div
            className={styles.image}
            style={{ ...style, backgroundImage: `url("${imageUrl}")` }}
            onDoubleClick={this.openEditor}
          />
        </>
      )
    } if (preview && model.props.sourceType === 'ConditionalImage') {
      return (
        <div
          className={styles.image}
          style={{ ...style, backgroundImage: `url(${GetImageURL.run(model)})` }}
        />
      )
    }
    if (preview && model.props.sourceType === 'ResponseImage') {
      const result = ResultStore.results[model.assessment_id]
      if (!result) { return null }

      const mediaResponse = _.find(result.mediaResponses, mr => mr.question_id === model.props.sourceQuestion)
      if (!mediaResponse) { return null }
      return (
        <img
          className={`${styles.image} ${styles.responseImage}`}
          src={mediaResponse.url}
          style={{
            ...style,
            maxWidth: model.props.position.width,
            maxHeight: model.props.position.height,
          }}
          onLoad={this.load}
        />
      )
    }
    return (preview ? null : this.renderText())
  }

  buildStyles (flipContent) {
    const { module, reportStyles } = this.props
    const {
      borderColor = {}, borderWidth, borderStyle, borderRadius,
    } = (module.props.style || {})
    let style = joinStyles(reportStyles, module.props.styleIds)

    style.borderRadius = assignStyle(style, 'borderRadius', borderRadius)

    if (module.props.border) {
      if (borderWidth) { style.borderWidth = `${borderWidth}px` }
      if (borderStyle) { style.borderStyle = `${borderStyle || 'solid'}` }
      if (borderColor) { style.borderColor = convertColor(borderColor) }
    }
    style = _.omit(style, 'border')
    if (flipContent && module.props.flipImageForOtherDirectionLang) {
      style.transform = 'scaleX(-1)'
    }

    return style
  }

  renderText () {
    const style = this.buildStyles()

    return (
      <div style={style} className={styles.image} onDoubleClick={this.openEditor}>
        <span>Image</span>
      </div>
    )
  }

  render () {
    const { module, reportStyles, flipContent } = this.props
    const {
      borderRadius,
    } = (module.props.style || {})

    const style = joinStyles(reportStyles, module.props.styleIds)

    const outerStyle = {}
    outerStyle.borderRadius = assignStyle(style, 'borderRadius', borderRadius)

    if (style.boxShadow?.enabled) {
      const {
        x, y, blur, spread = 0, color = '#000000',
      } = style.boxShadow
      outerStyle.boxShadow = `${x || 0}px ${y || 0}px ${blur || 0}px ${spread || 0}px ${color}`

      if (flipContent) {
        outerStyle.boxShadow = `${-x || 0}px ${y || 0}px ${blur || 0}px ${spread || 0}px ${color}`
      }
    }

    return (
      <Foundation {...this.props} aspectRatio={module.props.aspectRatio} outerStyle={outerStyle}>
        {this.renderImg(flipContent)}
      </Foundation>
    )
  }
}

export default Image
