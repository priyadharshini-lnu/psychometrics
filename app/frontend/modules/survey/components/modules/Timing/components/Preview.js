import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Timer from './Timer'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    preview: PropTypes.bool,
  }

  componentWillMount () {
    const { model, readOnly } = this.props
    if (readOnly) { return null }
    model.result.answer(0, 0, 0, 0)
  }

  click = (miliseconds) => {
    const { model } = this.props
    miliseconds = _.round(miliseconds / 1000, 2)
    let {
      firstClick, lastClick, clickCount,
    } = model.result.answers
    const { pageSubmit } = model.result.answers
    if (clickCount === 0) firstClick = miliseconds
    lastClick = miliseconds
    clickCount += 1
    model.result.answer(firstClick, lastClick, pageSubmit, clickCount)
    this.forceUpdate()
  }

  // TODO: Implement when will be ready flow
  enableSubmit = () => {
    // eslint-disable-next-line no-console
    console.info('Now Submit button is enable')
  }

  // TODO: Implement when will be ready flow
  autoAdvance = () => {
    // eslint-disable-next-line no-console
    console.info('Auto Advance')
  }

  /* TODO : Count page submit */
  render () {
    const { model, readOnly, preview } = this.props
    if (readOnly) { return null }
    const {
      firstClick, lastClick, pageSubmit, clickCount,
    } = model.result.answers
    const moduleStyle = {
      display: preview ? 'none' : '',
    }
    const style = {
      display: model.props.showTimer ? 'none' : '',
    }
    if (model.props.showTimer) {
      moduleStyle.display = ''
      style.display = preview ? 'none' : ''
    }
    return (
      <div style={moduleStyle}>
        <div style={style}>
          <strong>These page timer metrics will not be displayed to the recipient.</strong>
          <ul>
            <li>
              First Click:
              {firstClick}
              {' '}
              seconds
            </li>
            <li>
              Last Click:
              {lastClick}
              {' '}
              seconds
            </li>
            <li>
              Page Submit:
              {pageSubmit}
              {' '}
              seconds
            </li>
            <li>
              Click Count:
              {clickCount}
            </li>
          </ul>
        </div>
        <Timer
          model={model}
          startTimer
          onBodyClick={this.click}
          onEnableSubmit={this.enableSubmit}
          onAutoAdvance={this.autoAdvance}
        />
      </div>
    )
  }
}

export default Preview
