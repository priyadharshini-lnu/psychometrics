import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import DataSource from 'rb/components/DataSourceMenu'
import store from 'rb/store/PropertyPanelStore'
import FilterStore from 'rb/store/modals/FilterStore'
import PropertyFilter from 'rb/components/PropertyFilter'
import ColorSet from 'rb/components/ColorSet'
import PropertyFonts from 'rb/components/PropertyFonts'
import ConditionTextStore from 'rb/store/modals/ConditionTextStore'
import ChartProps from './Charts/Properties'
import iconsStyles from './Graph.scss'
import Menu from './ChartsMenu'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    this.filterListener = FilterStore.addListener('change', () => this.forceUpdate())
    this.listener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.filterListener.remove()
    this.listener.remove()
  }

  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  changeFontColor = (color) => {
    store.model.props.style.fontColor = color.hex
  }

  select = (type, presetName) => {
    const { model } = this.props
    model.changeType(type, presetName)
    store.update()
    this.forceUpdate()
  }

  checkboxHandler = (type, e) => {
    const { model } = this.props
    model.props[type] = e.currentTarget.checked
    this.update()
  }

  reset () {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      store.model.reset()
      this.forceUpdate()
    }
  }

  openConditionModal () {
    ConditionTextStore.open(store.model)
  }

  renderCustomProperties () {
    const { model } = this.props
    if (!model.props.type) {
      return null
    }

    const View = ChartProps[`${model.props.type}Properties`]

    return (
      <View model={model} />
    )
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <div className={styles.title}>Graph Options</div>
        <span className={styles.label}>Graph Type</span>
        <div className={styles.dropdownWrapper}>
          <button
            type="button"
            data-toggle="dropdown"
            className={`btn btn-default dropdown-toggle ${styles.menuButton}`}
          >
            <span className={`${iconsStyles[model.moduleConfig.chartsIcons[model.props.type]]} ${styles.icon}`} />
            <span>{model.moduleConfig.charts[model.props.type] || 'Choose Type'}</span>
            <span className="caret" />
          </button>
          <Menu model={model} onSelect={this.select} />
        </div>
        <DataSource model={model} onSelect={this.update} onlyNumbers />
        <hr className={styles.divider} />
        <div className="margin-top-10 margin-bottom-10">
          <div
            style={{ width: '100%' }}
            onClick={this.openConditionModal}
            className="btn btn-default"
          >
            Manage styles condition
          </div>
        </div>
        {this.renderCustomProperties()}
        <div className="margin-top-10">
          <PropertyFilter />
        </div>
        <hr className={styles.divider} />
        <div className="margin-top-10">Font</div>
        <PropertyFonts />
        <div style={{ position: 'relative' }}>
          <div className="margin-top-10">Colors</div>
          <ColorSet model={model} />
        </div>
        <div className="margin-top-10">
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.showValues || false}
              onChange={e => this.checkboxHandler('showValues', e)}
            />
            Show Values
          </label>
        </div>
        <hr className={styles.divider} />
        <div className={`${styles.block} ${styles.reset}`} onClick={this.reset}>
          Reset Graph...
        </div>

      </div>
    )
  }
}

export default Properties
