import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SingleAnswerPreview from './SingleAnswerPreview'
import DropdownPreview from './DropdownPreview'

const PREVIEWS = {
  SingleAnswer: SingleAnswerPreview,
  MultipleAnswer: SingleAnswerPreview,
  Dropdown: DropdownPreview,
}

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    preview: PropTypes.bool,
  }

  renderLikretPreview () {
    const { model: { props } } = this.props
    const View = PREVIEWS[props.answersType]
    return <View {...this.props} />
  }

  render () {
    return (
      <div>
        {this.renderLikretPreview()}
      </div>
    )
  }
}
