import _ from 'lodash'
import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import { Properties } from 'rb/components/modules'
import ModuleModel from 'rb/models/Module'
import styles from './PropertyPanel.scss'
import ColorPickerModal from './ColorPickerModal'

const { $ } = window

class PropertyPanel extends Component {
  state = {
    popupOpen: false,
  }

  componentDidMount () {
    $(this.inspector).on('show.bs.dropdown', `.${styles.dropdownWrapper}, .color-picker`, () => {
      this.scrollTop = this.inspector.scrollTop
      this.setState({ popupOpen: true })
    })
    $(this.inspector).on('hide.bs.dropdown', `.${styles.dropdownWrapper}, .color-picker`, () => {
      this.scrollTop = 0
      this.setState({ popupOpen: false })
    })
  }

  layoutHandler = (method) => {
    const layout = store.model.layout()
    layout[method](store.model)
    this.forceUpdate()
  }

  showOnAllPages = () => {
    const { module } = this.props
    const model = new ModuleModel(module, { id: module.page_id })
    model.props.showOnAllPages = !model.props.showOnAllPages
    model.update()
  }

  renderCustomProperties () {
    const { selected, module } = this.props
    if (!module || !selected) { return null }
    const type = selected.type === 'Module' ? module.type : selected.type
    const View = Properties[`${type}Properties`]
    if (!View) { return }
    const model = new ModuleModel(module, { id: module.page_id })
    return (<View model={model} />)
  }

  renderLayout () {
    const { module } = this.props
    if (!module) { return null }
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
                checked={module.props.onTop || false}
                onChange={e => this.layoutHandler('alwaysOnTop', e)}
              />
              Always On Top
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={module.props.onBottom || false}
                onChange={e => this.layoutHandler('alwaysOnBottom', e)}
              />
              Always On Bottom
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={module.props.showOnAllPages || false}
                onChange={() => this.showOnAllPages()}
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
    const { selected } = this.props
    const { popupOpen } = this.state
    const inspectorClasses = [styles.inspector]
    let style = {}
    if (popupOpen) {
      inspectorClasses.push(styles.dropdownOpen)
      if (this.scrollTop > 0) {
        style = {
          marginTop: -this.scrollTop,
        }
      }
    }
    return (
      <>
        <div className={inspectorClasses.join(' ')} ref={(ref) => { this.inspector = ref }} style={style}>
          <div className={styles.main}>
            {this.renderCustomProperties()}
            {selected.type === 'Module' && this.renderLayout()}
          </div>
        </div>
        <ColorPickerModal />
      </>
    )
  }
}

export default PropertyPanel
