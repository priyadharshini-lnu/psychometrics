import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'

import { LibraryStore } from '~/libs/library'
import Socket from '~/modules/survey/cable'
import LibraryTransport from '~/modules/survey/cable/LibraryChannel'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  componentDidMount () {
    LibraryTransport.init()
    this.librarySocket = Socket.library()
  }

  onSelectGraphic = (item) => {
    const { model } = this.props
    model.changeProps({ graphicUrl: item.file })
  }

  openLibrary = () => {
    LibraryStore.openPopup(this.librarySocket, this.onSelectGraphic, 'image')
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  changeInteractivity = (e) => {
    const { model } = this.props
    model.changeProps({ interactivity: e.currentTarget.value })
  }

  changeAlwaysVisible = (e) => {
    const { model } = this.props
    model.changeProps({ alwaysVisible: (e.currentTarget.value === 'true') })
  }

  changeRegionsNames = (e) => {
    const { model, shapeIndex } = this.props
    model.changeArrayProps({ collection: 'regionsNames', i: shapeIndex, val: e.currentTarget.value })
  }

  renderRegionsNames () {
    const { model, model: { props: { regionsNames } }, shapeIndex } = this.props

    if (shapeIndex === null) { return }

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Name of Shape</div>
        <input
          onChange={this.changeRegionsNames}
          value={regionsNames[shapeIndex] || model.moduleConfig.defaultChoiceText(shapeIndex + 1)}
        />
      </div>
    )
  }

  renderInteractivity () {
    const { model, model: { props: { interactivity } } } = this.props

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Interactivity</div>
        <label className={styles.inputLabel}>
          <input
            checked={interactivity === 'Switcher'}
            type="radio"
            name={`q_${model.id}_interactivity`}
            onChange={this.changeInteractivity}
            value="Switcher"
          />
          {' '}
          On / Off
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={interactivity === 'Liker'}
            type="radio"
            name={`q_${model.id}_interactivity`}
            onChange={this.changeInteractivity}
            value="Liker"
          />
          {' '}
          Like / Dislike
        </label>
      </div>
    )
  }

  renderAlwaysVisible () {
    const { model, model: { props: { alwaysVisible } } } = this.props

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Visibility</div>
        <label className={styles.inputLabel}>
          <input
            checked={alwaysVisible === true}
            type="radio"
            name={`q_${model.id}_always_visible`}
            onChange={this.changeAlwaysVisible}
            value="true"
          />
          {' '}
          Always visible
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={alwaysVisible === false}
            type="radio"
            name={`q_${model.id}_always_visible`}
            onChange={this.changeAlwaysVisible}
            value="false"
          />
          {' '}
          Hidden until hover
        </label>
      </div>
    )
  }

  render () {
    const { restricted, model } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <a onClick={this.openLibrary} className="btn btn-default">
            Choose Graphic
          </a>
        </div>
        {this.renderRegionsNames()}
        {this.renderInteractivity()}
        {this.renderAlwaysVisible()}
        <hr className={styles.divider} />
        {!restricted && (
          <ValidationTypes
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}

export default Properties
