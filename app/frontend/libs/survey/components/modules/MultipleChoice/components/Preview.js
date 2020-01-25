import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './MultipleChoice.scss'
import Previews from './Previews'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderAnswersType () {
    const { model, readOnly } = this.props
    const { type } = model.props
    const View = Previews[type]
    return <View model={model} preview readOnly={readOnly} />
  }

  renderContainer (html, classWithLtr) {
    // eslint-disable-next-line react/no-danger
    return (<div className={classWithLtr} dangerouslySetInnerHTML={{ __html: html }} />)
  }

  render () {
    const { model } = this.props
    const html = I18nStore.tQuestion(model, 'questionText')
    let previewWithLtr = styles.questionTextPreview
    if (model.isNeedToAddLtrManually) {
      if (previewWithLtr.indexOf('ltr_direction') === -1) {
        previewWithLtr += ` ${styles.ltr_direction}`
      }
    }
    return (
      <div>
        {this.renderContainer(html, previewWithLtr)}
        {this.renderAnswersType()}
      </div>
    )
  }
}

export default Preview
