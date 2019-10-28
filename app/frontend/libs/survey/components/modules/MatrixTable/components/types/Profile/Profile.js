import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SingleAnswer from './SingleAnswer'
import Dropdown from './Dropdown'

const TYPES = {
  SingleAnswer,
  MultipleAnswer: SingleAnswer,
  Dropdown,
}
export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    preview: PropTypes.bool,
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.props.choicesTexts[i] = text
    model.update()
    this.forceUpdate()
  }

  renderLikretType () {
    const { model } = this.props
    const View = TYPES[model.props.answersType]
    return <View {...this.props} />
  }

  render () {
    return (
      <div>
        {this.renderLikretType()}
      </div>
    )
  }
}
