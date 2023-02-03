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
