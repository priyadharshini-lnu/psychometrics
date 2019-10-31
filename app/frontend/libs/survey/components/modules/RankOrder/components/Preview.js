/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styles from './RankOrder.scss'
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

  render () {
    const { model } = this.props
    return (
      <DndProvider backend={HTML5Backend}>
        <div>
          <div
            className={styles.questionTextPreview}
            dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
          />
          {this.renderAnswersType()}
        </div>
      </DndProvider>
    )
  }
}

export default Preview
