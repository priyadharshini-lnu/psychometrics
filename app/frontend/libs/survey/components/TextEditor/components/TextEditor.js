/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ContentEditable from 'react-contenteditable'
import styles from './TextEditor.scss'

export class TextEditor extends Component {
  hover = false

  static propTypes = {
    value: PropTypes.string.isRequired,
    styles: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      normal: true,
      value: props.value,
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.editor) {
      return nextState.value !== this.editor.innerHTML
    }
    return true
  }

  edit = () => {
    const { value } = this.props
    this.hover = true
    this.setState({ edit: true, value })
    setTimeout(() => {
      if (this.editor) {
        this.selectElementContents(this.editor.htmlEl)
      }
    }, 100)
  }

  selectElementContents = (el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }


  blur = () => {
    const { onChange } = this.props
    const { value } = this.state
    if (this.hover) { return }
    this.setState({ edit: false })
    onChange && onChange(value.trim())
  }


  keyup = (e) => {
    if (e.keyCode === 27) {
      this.setState({ edit: false, value: e.currentTarget.innerHTML })
    }
    const value = e.currentTarget.innerHTML
    this.setState({ value })
  }

  change = (e) => {
    this.setState({ value: e.currentTarget.value })
  }


  mouseEnter = () => {
    this.hover = true
  }

  mouseLeave = () => {
    this.hover = false
  }

  normalMode = () => {
    this.setState({ normal: true })
  }

  htmlMode = () => {
    this.setState({ normal: false })
  }

  onRichChange = (data) => {
    const { onChange } = this.props
    onChange && onChange(data)
  }

  openRichEditor = () => {
    const { openRichEditor } = this.props
    const { value } = this.state
    this.setState({ edit: false })
    openRichEditor({ value, onSave: this.onRichChange })
  }

  changeText = (e) => {
    this.setState({ value: e.target.value })
  }

  contentEdit () {
    const { value } = this.state
    return (
      <ContentEditable
        ref={(ref) => { this.editor = ref }}
        className={styles.editor}
        onBlur={this.blur}
        onChange={this.changeText}
        html={value}
      />
    )
  }

  htmlEdit () {
    const { value } = this.state
    return (
      <textarea
        ref={(ref) => { this.editor = ref }}
        className={styles.editor}
        onChange={this.change}
        onBlur={this.blur}
        type="text"
        autoComplete="off"
        value={value}
      />
    )
  }

  renderValue () {
    const { value } = this.props
    const { value: svalue, edit } = this.state
    return { __html: edit ? svalue : value }
  }

  renderText () {
    const { styles: css } = this.props
    return (
      <div
        className={`${styles.editable} ${css}`}
        onClick={this.edit}
        dangerouslySetInnerHTML={this.renderValue()}
      />
    )
  }

  renderEdit () {
    const { normal } = this.state
    return (
      <div style={{ position: 'relative' }} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        {normal ? this.contentEdit() : this.htmlEdit()}
        <a onClick={this.openRichEditor} className={`${styles.richEditBtn} ${styles.richEditBtnFloat}`}>
          <span className={`fa fa-font ${styles.icon}`} />
          Rich Content Editor...
        </a>
        <a
          onClick={this.htmlMode}
          className={`${styles.richEditBtn} ${styles.htmlEditBtn} ${normal && styles.disabled}`}
        >
          <span className={`fa fa-font ${styles.icon}`} />
          HTML View
        </a>
        <a
          onClick={this.normalMode}
          className={`${styles.richEditBtn} ${styles.normalEditBtn} ${!normal && styles.disabled}`}
        >
          <span className={`fa fa-font ${styles.icon}`} />
          Normal View
        </a>
      </div>
    )
  }

  render () {
    const { edit } = this.state
    return (edit ? this.renderEdit() : this.renderText())
  }
}

export default TextEditor
