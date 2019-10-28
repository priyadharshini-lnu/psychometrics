import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

import { LibraryStore } from 'psychometrics-library-ui'
import Socket from 'cable'
import LibraryTransport from 'cable/LibraryChannel'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    LibraryTransport.init()
    this.librarySocket = Socket.library()
  }

  openGraphicsLibrary = () => {
    LibraryStore.openPopup(this.librarySocket, this.onSelectGraphic, 'image')
  }

  openFilesLibrary = () => {
    LibraryStore.openPopup(this.librarySocket, this.onSelectGraphic)
  }

  onSelectGraphic = (item) => {
    const { model } = this.props
    model.changeProps({ graphicUrl: item.file })
    this.forceUpdate()
  }

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ type })
    this.update()
  }

  changeGraphicType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ graphicType: type })
    this.update()
  }

  update = () => {
    PropertyPanelStore.update()
  }

  changeUrl = (e) => {
    const { model } = this.props
    const val = e.currentTarget.value
    if (val.match(/(https?:\/\/.*\.(?:png|jpg))/i)) {
      model.changeProps({ graphicUrl: val })
      this.update()
    }
  }

  renderUrlInput (type) {
    if (type === 'Url' || type === 'UrlWithText') {
      return (
        <div>
          <div className={styles.label}>Graphic URL</div>
          <input onChange={this.changeUrl} />
        </div>
      )
    }
    return null
  }

  renderGraphicBtn (type) {
    if (type === 'NoText' || type === 'WithText') {
      return (
        <div>
          <div className={styles.label}>Choose a Graphic</div>
          <a onClick={this.openGraphicsLibrary} className={`btn btn-default ${styles.button}`}>Choose a Graphic</a>
        </div>
      )
    }
  }

  renderFileBtn () {
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Choose a File</div>
        <a onClick={this.openFilesLibrary} className={`btn btn-default ${styles.button}`}>Choose a File</a>
      </div>
    )
  }

  renderGraphicOptions () {
    const { model } = this.props
    const type = model.props.graphicType

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Graphic Options</div>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'NoText'}
            type="radio"
            name={`q_${model.id}_graphic_type`}
            onChange={this.changeGraphicType}
            value="NoText"
          />
          {' '}
          No Text
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'WithText'}
            type="radio"
            name={`q_${model.id}_graphic_type`}
            onChange={this.changeGraphicType}
            value="WithText"
          />
          {' '}
          With Text
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'Url'}
            type="radio"
            name={`q_${model.id}_graphic_type`}
            onChange={this.changeGraphicType}
            value="Url"
          />
          {' '}
          From URL
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'UrlWithText'}
            type="radio"
            name={`q_${model.id}_graphic_type`}
            onChange={this.changeGraphicType}
            value="UrlWithText"
          />
          {' '}
          From URL With Text
        </label>
        {this.renderGraphicBtn(type)}
        {this.renderUrlInput(type)}
      </div>
    )
  }

  render () {
    const { model } = this.props
    const { type } = model.props

    return (
      <div>
        <div className={styles.fieldset}>
          <div className={styles.label}>Answers</div>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Text'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Text"
            />
            {' '}
            Text
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Graphic'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Graphic"
            />
            {' '}
            Graphic
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'File'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="File"
            />
            {' '}
            File
          </label>
        </div>
        {type === 'Graphic' && this.renderGraphicOptions()}
        {type === 'File' && this.renderFileBtn()}
      </div>
    )
  }
}

export default Properties
