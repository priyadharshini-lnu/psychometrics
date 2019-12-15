/* eslint-disable no-unused-expressions */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './InlineEditor.scss'

export class InlineEditor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    styles: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  constructor (props) {
    super(props)

    this.state = {
      edit: false,
      value: props.value,
      width: 0,
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { edit } = this.state
    if (edit) {
      this.editor.focus()
    }
    if (edit && !prevState.edit) {
      this.editor.select()
    }
  }

  edit = () => {
    const { value } = this.state
    const { value: val } = this.props
    const width = value.length * 8
    this.setState({ edit: true, value: val, width })
  }

  blur = () => {
    const { value } = this.state
    const { onChange } = this.props
    this.setState({ edit: false })
    onChange && onChange(value)
  }

  keydown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      this.blur()
    }

    if (e.keyCode === 27) {
      this.setState({ edit: false })
    }
  }

  change = (e) => {
    const { value } = this.state
    const width = value.length * 8
    this.setState({ value: e.currentTarget.value, width })
  }

  renderText () {
    const { styles: css, value } = this.props
    return (<span className={`${styles.editable} ${css}`} onClick={this.edit}>{value}</span>)
  }

  renderEdit () {
    const { value, width } = this.state
    return (
      <textarea
        ref={(ref) => { this.editor = ref }}
        style={{ width }}
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

export default InlineEditor
