import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import DataSource from '~/modules/reports/components/DataSourceMenu'
import AppStore from '~/modules/reports/store/AppStore'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import ColorSet from '~/modules/reports/components/ColorSet'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import ChartProps from './Charts/Properties'
import iconsStyles from './Graph.less'
import Menu from './ChartsMenu'
import connect from '../connect'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    this.appListener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.appListener.remove()
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeFontColor = (color) => {
    const { model } = this.props
    model.props.style.fontColor = color.hex
    model.update()
  }

  changeTransparentBackground = (e) => {
    const { model } = this.props
    model.props.transparentBackground = e.currentTarget.checked
    model.update()
  }

  select = (type, presetName) => {
    const { model } = this.props
    model.changeType(type, presetName)
    model.update()
  }

  checkboxHandler = (type, e) => {
    const { model } = this.props
    model.props[type] = e.currentTarget.checked
    this.update()
  }

  reset = () => {
    const { model } = this.props
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      model.reset()
      this.forceUpdate()
    }
  }

  openConditionModal = () => {
    const { model, openConditionalText } = this.props
    openConditionalText({ module: model })
  }

  changePrecision = (val) => {
    const { model } = this.props
    model.props.precision = val
    this.update()
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
    const { model, reportStlyes } = this.props
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
        <hr className={styles.divider} />
        <div className="margin-top-10">
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.transparentBackground || false}
              onChange={this.changeTransparentBackground}
            />
            Transparent background
          </label>
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
          <PropertyFilter model={model} />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          <div className="margin-top-10">Number Precision</div>
          <label className={styles.inputLabel}>
            <ChoicesInput
              value={model.props.precision}
              onChange={this.changePrecision}
              minValue={0}
              maxValue={9}
            />
          </label>
        </div>
        <hr className={styles.divider} />
        <div className="margin-top-10">Font</div>
        <PropertyFonts model={model} reportStlyes={reportStlyes} />
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

      </div>
    )
  }
}

export default connect(Properties)
