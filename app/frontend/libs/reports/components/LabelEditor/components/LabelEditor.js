/*
  Inline labels editor

  Usage example:
  class Page extends Component {
    getInitialState () {
      return {
        value: 'Click to change...'
      }
    },

    change (value) {
      this.setState({value})
    },

    render () {
      return (<LabelEditor value={this.state.value} onChange={this.change} />)
    }
  })

  Props:
    value: value
    onChange: will trigger when data changed
    readOnly: prevent edit action
    width: width of input
    maxWidth: max width of input
    styles: style overider for label
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './LabelEditor.scss'

export class LabelEditor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    width: PropTypes.any,
    maxWidth: PropTypes.any,
    styles: PropTypes.string,
  }

  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      value: props.value,
    }
  }

  componentDidUpdate () {
    const { edit } = this.state
    if (edit) {
      this.editor.focus()
    }
  }

  edit = () => {
    const { readOnly, value } = this.props
    if (readOnly) { return }
    this.setState({ edit: true, value })
  }

  blur = () => {
    const { value } = this.state
    const { onChange } = this.props
    this.setState({ edit: false })
    onChange && onChange(value)
  }

  keydown = (e) => {
    if (e.keyCode === 13) {
      this.blur()
    }

    if (e.keyCode === 27) {
      this.setState({ edit: false })
    }
  }

  change = (e) => {
    this.setState({ value: e.currentTarget.value })
  }

  renderText () {
    const { styles: style, value } = this.props
    const overider = style || ''
    return (
      <span
        className={`${styles.editable} ${overider}`}
        onClick={this.edit}
      >
        {value}
      </span>
    )
  }

  renderEdit () {
    const { value } = this.state
    const { width, maxWidth } = this.props
    const style = {
      width,
      maxWidth,
    }
    return (
      <textarea
        ref={(ref) => { this.editor = ref }}
        style={style}
        className={styles.editor}
        onKeyDown={this.keydown}
        onChange={this.change}
        onBlur={this.blur}
        type="text"
        autoComplete="off"
        value={value}
      />
    )
  }

  render () {
    const { edit } = this.state
    return (edit ? this.renderEdit() : this.renderText())
  }
}

export default LabelEditor
