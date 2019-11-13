import _ from 'lodash'
import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import { Properties } from 'rb/components/modules'
import Action from 'rb/undo'
import styles from './PropertyPanel.scss'

const { $ } = window

class PropertyPanel extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
    $(this.inspector).on('show.bs.dropdown', `.${styles.dropdownWrapper}`, () => {
      store.popupOpened()
    })
    $(this.inspector).on('hide.bs.dropdown', `.${styles.dropdownWrapper}`, () => {
      store.popupClosed()
    })
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  changeType = (type, props = {}) => {
    if (store.question.type === type) { return }
    Action('QuestionChangeType', store.question, { oldType: store.question.type, newType: type })
    store.question.changeType(type, props)
    store.update()
  }

  layoutHandler = (method) => {
    const layout = store.model.layout()
    layout[method](store.model)
    this.forceUpdate()
  }

  renderCustomProperties () {
    const { model } = store
    const type = store.type === 'Module' ? store.model.type : store.type
    const View = Properties[`${type}Properties`]
    if (!View) { return }
    return (<View model={model} />)
  }

  renderLayout () {
    const { model } = store
    return (
      <div className={styles.layout}>
        Layout
        <ul className={styles.variants}>
          {_.map(['alignLeft', 'alignRight', 'alignTop', 'alignBottom', 'alignMiddleVertical',
            'alignMiddleHorizontal'], type => (
              <li key={type}>
                <a
                  className={`${styles.alignedBlock} ${styles[type]}`}
                  onClick={e => this.layoutHandler(type, e)}
                />
              </li>
          ))}
        </ul>
        <ul>
          <li><a onClick={e => this.layoutHandler('moveInFront', e)}>Bring Forward</a></li>
          <li><a onClick={e => this.layoutHandler('moveInBack', e)}>Send Backward</a></li>

          <li>
            <label>
              <input
                type="checkbox"
                checked={model.props.onTop || false}
                onChange={e => this.layoutHandler('alwaysOnTop', e)}
              />
              Always On Top
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={model.props.onBottom || false}
                onChange={e => this.layoutHandler('alwaysOnBottom', e)}
              />
              Always On Bottom
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={model.props.showOnAllPages || false}
                onChange={e => this.layoutHandler('showOnAllPages', e)}
              />
              Show On All Pages
            </label>

          </li>
        </ul>
        <hr className={styles.divider} />
      </div>
    )
  }

  render () {
    const inspectorClasses = [styles.inspector]
    if (store.popupOpen) {
      inspectorClasses.push(styles.dropdownOpen)
    }
    return (
      <div className={inspectorClasses.join(' ')} ref={(ref) => { this.inspector = ref }}>
        <div className={styles.main}>
          {this.renderCustomProperties()}
          {store.type === 'Module' && this.renderLayout()}
        </div>
      </div>
    )
  }
}

export default PropertyPanel
