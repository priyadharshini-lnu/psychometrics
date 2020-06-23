/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'rb/store/PropertyPanelStore'
import styles from './Label.scss'

class LabelCell extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
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

  blur = () => {
    const { model } = this.props
    const { value } = this.state
    model.text = value.trim()
    module.update()
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

  doubleClick = () => {
    const { model } = this.props
    this.setState({ edit: true, value: model.text || '' })
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
    const text = model.text || model.value
    return (
      <span
        className={`${styles.editable}`}
        onClick={this.edit}
      >
        {text}
      </span>
    )
  }

  render () {
    const { model, colSpan } = this.props
    const { edit } = this.state
    return (
      <td
        colSpan={colSpan}
        className={`${styles.cell} ${styles.title}`}
        style={model.styles || {}}
        onClick={this.click}
        onDoubleClick={this.doubleClick}
      >
        {edit ? this.renderEdit() : this.renderText()}
      </td>
    )
  }
}

export default LabelCell
