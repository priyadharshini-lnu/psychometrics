/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './StaticContent.scss'
import Previews from './Previews'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderType (props) {
    const { model } = this.props
    const { type } = props
    if (type === 'Text') { return false }
    const View = Previews[type]
    return <View model={model} key={type} />
  }

  renderText (props) {
    const { model } = this.props
    const { type } = props
    let style = styles.questionTextPreview || ''
    if (model.isNeedToAddLtrManually) {
      style += ` ${styles.ltr_direction}`
    }
    const { graphicType } = props
    if (type === 'Text' || (type === 'Graphic' && (graphicType === 'WithText' || graphicType === 'UrlWithText'))) {
      return (
        <div
          className={style}
          dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
        />
      )
    }
  }

  render () {
    const { model, model: { props } } = this.props
    I18nStore.tQuestion(model, 'questionText')
    return (
      <div>
        {this.renderText(props)}
        {this.renderType(props)}
      </div>
    )
  }
}

export default Preview
