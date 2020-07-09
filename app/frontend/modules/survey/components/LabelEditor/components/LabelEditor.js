import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './LabelEditor.scss'

export class LabelEditor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    styles: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    maxWidth: PropTypes.any,
  }

  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      value: props.value,
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

  width = () => {
    const { value } = this.state
    const { maxWidth } = this.props
    const max = maxWidth || 500
    const width = value.length * 8 < 70 ? 70 : value.length * 8
    return width > max ? max : width
  }

  edit = () => {
    const { readOnly, value } = this.props
    if (readOnly) { return }
    const width = this.width()
    this.setState({ edit: true, value, width })
  }

  blur = () => {
    const { value } = this.state
    const { onChange } = this.props
    this.setState({ edit: false })
    onChange && onChange(value.trim())
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
    const width = this.width()
    this.setState({ value: e.currentTarget.value, width })
  }

  renderText () {
    const { styles: css, value } = this.props
    const overider = css || ''
    return (<span className={`${styles.editable} ${overider}`} onClick={this.edit}>{value}</span>)
  }

  renderEdit () {
    const { width, value } = this.state
    const { maxWidth } = this.props
    const style = {
      width,
      minWidth: maxWidth ? 0 : '120px',
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
