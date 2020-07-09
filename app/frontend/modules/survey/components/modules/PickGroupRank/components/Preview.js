/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styles from './PickGroupRank.scss'
import Previews from './Previews'
import connect from '../connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderAnswersType () {
    const { readOnly, model } = this.props
    const { type } = model.props
    const View = Previews[type]
    return <View {...this.props} model={model} preview readOnly={readOnly} />
  }

  render () {
    const { model, I18n } = this.props
    return (
      <DndProvider backend={HTML5Backend}>
        <div>
          <div
            className={styles.questionTextPreview}
            dangerouslySetInnerHTML={{ __html: I18n.tQuestion(model, 'questionText') }}
          />
          {this.renderAnswersType()}
        </div>
      </DndProvider>
    )
  }
}

export default connect(Preview)
