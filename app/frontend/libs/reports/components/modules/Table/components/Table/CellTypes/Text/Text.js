/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'rb/store/PropertyPanelStore'
import styles from './Text.scss'

class TextCell extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    title: PropTypes.bool,
  }

  state = {
    edit: false,
    value: '',
  }

  componentDidUpdate () {
    const { edit } = this.state
    if (edit) {
      this.editor.focus()
    }
  }

  click = (e) => {
    if (store.type === 'Module' && store.model.type === 'Table') {
      e.stopPropagation()
      // store.select('Cell', this.props.model)
    }
  }

  doubleClick = () => {
    const { model } = this.props
    if (store.type === 'Module' && store.model.type === 'Table') {
      this.setState({ edit: true, value: model.text || model.content })
    }
  }

  blur = () => {
    const { model, module } = this.props
    const { value } = this.state
    model.text = value
    if (module) {
      module.update()
    }
    this.setState({ edit: false, value: '' })
  }

  keydown = (e) => {
    e.stopPropagation()
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


  renderEdit () {
    const { value } = this.state
    return (
      <input
        ref={(ref) => { this.editor = ref }}
        className={styles.editor}
        onKeyDown={this.keydown}
        onChange={this.change}
        onBlur={this.blur}
        type="text"
        autoComplete="off"
        value={value || ''}
      />
    )
  }

  renderText () {
    const { model } = this.props
    return (
      <span
        className={`${styles.editable}`}
        onClick={this.edit}
      >
        {model.text || model.value}
      </span>
    )
  }

  render () {
    const { title } = this.props
    const { edit } = this.state
    return (
      <td
        className={`${styles.cell} ${title ? styles.title : ''}`}
        onClick={this.click}
        onDoubleClick={this.doubleClick}
      >
        {edit ? this.renderEdit() : this.renderText()}
      </td>
    )
  }
}

export default TextCell
