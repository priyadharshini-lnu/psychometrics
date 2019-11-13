import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import { RequiredValidations } from 'components/Validations'
import ChoicesInput from 'components/ChoicesInput'

const TEXT_POSITIONS = ['Above', 'Below', 'Left', 'Right']
const SLIDER_POSITIONS = ['Horizontal', 'Vertical']
const CATEGORIES = ['Gauges', 'Bars']
const MODIFICATIONS = {
  gauges: [
    { value: 'gauge', label: 'Ten Gauge' },
    { value: 'thermometer', label: 'Thermometer' },
    { value: 'stop_light', label: 'Stop Light' },
    { value: 'smile', label: 'Smile' },
    { value: 'grades_plus_minus', label: 'Grades +/-' },
    { value: 'grades', label: 'Grades' },
  ],
  bars: [
    { value: '5scale', label: '5 Scale' },
    { value: '5scale_text', label: '5 Scale w/Text' },
    { value: '7scale', label: '7 Scale' },
    { value: '7scale_text', label: '7 Scale w/Text' },
    { value: '9scale', label: '9 Scale' },
    { value: '9scale_text', label: '9 Scale w/Text' },
  ],
}
const BAR_TYPES = [
  { value: 'horizontal_bars', label: 'Horizontal Bars' },
  { value: 'disks', label: 'Disks' },
  { value: 'building_blocks', label: 'Building Blocks' },
]

const MIN_VALUE = {
  gauges: {
    gauge: 0,
    thermometer: 0,
    stop_light: 1,
    smile: 1,
    grades_plus_minus: 1,
    grades: 1,
  },
  bars: {
    '5scale': 1,
    '5scale_text': 1,
    '7scale': 1,
    '7scale_text': 1,
    '9scale': 1,
    '9scale_text': 1,
  },
}

const MAX_VALUE = {
  gauges: {
    gauge: 10,
    thermometer: 10,
    stop_light: 3,
    smile: 5,
    grades_plus_minus: 13,
    grades: 5,
  },
  bars: {
    '5scale': 5,
    '5scale_text': 5,
    '7scale': 7,
    '7scale_text': 7,
    '9scale': 9,
    '9scale_text': 9,
  },
}

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  update = () => {
    const { model } = this.props
    model.update()
    PropertyPanelStore.update()
  }

  changeTextPosition = (e) => {
    const { model } = this.props
    model.changeProps({ textPosition: e.currentTarget.value })
    this.forceUpdate()
  }

  changeSliderPosition = (e) => {
    const { model } = this.props
    model.changeProps({ sliderPosition: e.currentTarget.value })
    this.forceUpdate()
  }

  updateProps = (val, fieldName) => {
    const { model } = this.props
    model.changeProps({ [fieldName]: val })
    this.forceUpdate()
  }

  changeCategory = (e) => {
    const { model } = this.props
    const modification = _.first(MODIFICATIONS[e.currentTarget.value]).value
    const min = MIN_VALUE[e.currentTarget.value][modification]
    const max = MAX_VALUE[e.currentTarget.value][modification]
    model.changeProps({
      category: e.currentTarget.value, modification, min, max, value: min,
    })
    this.forceUpdate()
  }

  changeModification = (e) => {
    const { model } = this.props
    const min = MIN_VALUE[model.props.category][e.currentTarget.value]
    const max = MAX_VALUE[model.props.category][e.currentTarget.value]
    model.changeProps({
      modification: e.currentTarget.value, min, max, value: min,
    })
    this.forceUpdate()
  }

  changeBarType = (e) => {
    const { model } = this.props
    model.changeProps({ barType: e.currentTarget.value })
    this.forceUpdate()
  }

  renderTextPosition () {
    const { model, model: { props: { textPosition } } } = this.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Text Position</div>
        {
          TEXT_POSITIONS.map((position) => {
            const value = position.toLowerCase()
            return (
              <label key={position} className={styles.inputLabel}>
                <input
                  checked={textPosition === value}
                  type="radio"
                  name={`q_${model.id}_text_position`}
                  onChange={this.changeTextPosition}
                  value={value}
                />
                {' '}
                {`${position}`}
              </label>
            )
          })
        }
      </div>
    )
  }

  renderSliderPosition () {
    const { model, model: { props: { sliderPosition } } } = this.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Slider Position</div>
        {
          SLIDER_POSITIONS.map((position) => {
            const value = position.toLowerCase()
            return (
              <label key={position} className={styles.inputLabel}>
                <input
                  checked={sliderPosition === value}
                  type="radio"
                  name={`q_${model.id}_slider_position`}
                  onChange={this.changeSliderPosition}
                  value={value}
                />
                {' '}
                {`${position}`}
              </label>
            )
          })
        }
      </div>
    )
  }

  renderSliderMargin () {
    const { model } = this.props
    if (model.props.sliderPosition !== 'vertical') { return null }
    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Slider Margin</span>
        <ChoicesInput
          maxValue={100}
          value={model.props.sliderMargin}
          model={model}
          onChange={value => this.updateProps(value, 'sliderMargin')}
        />
      </div>
    )
  }


  renderCategory () {
    const { model } = this.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Category</div>
        {
          CATEGORIES.map((category) => {
            const value = category.toLowerCase()
            return (
              <label key={category} className={styles.inputLabel}>
                <input
                  checked={model.props.category === value}
                  type="radio"
                  name={`q_${model.id}_category`}
                  onChange={this.changeCategory}
                  value={value}
                />
                {' '}
                {`${category}`}
              </label>
            )
          })
        }
      </div>
    )
  }

  renderModification () {
    const { model } = this.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>{_.capitalize(model.props.category)}</div>
        {
          MODIFICATIONS[model.props.category].map((modification, index) => {
            const checked = (model.props.modification === null && index === 0)
              ? true
              : model.props.modification === modification.value
            return (
              <label key={modification.value} className={styles.inputLabel}>
                <input
                  checked={checked}
                  type="radio"
                  name={`q_${model.id}_modification`}
                  onChange={this.changeModification}
                  value={modification.value}
                />
                {' '}
                {`${modification.label}`}
              </label>
            )
          })
        }
      </div>
    )
  }

  renderLabels () {
    const { model } = this.props

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Labels</div>
        <div>
          <label className={styles.inputLabel}>
            <input
              type="checkbox"
              checked={model.props.enableLabels}
              onChange={({ currentTarget }) => { this.updateProps(currentTarget.checked, 'enableLabels') }}
            />
            {' Enable Labels'}
          </label>
          {model.props.enableLabels && (
          <input
            value={model.props.labelLow}
            placeholder="Low Label"
            onChange={({ currentTarget }) => this.updateProps(currentTarget.value, 'labelLow')}
          />
          )}
          {model.props.enableLabels && (
          <input
            value={model.props.labelHigh}
            placeholder="High Label"
            onChange={({ currentTarget }) => this.updateProps(currentTarget.value, 'labelHigh')}
          />
          )}
        </div>
      </div>
    )
  }

  renderBarType () {
    const { model } = this.props
    if (model.props.category !== 'bars') return
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Bar Type</div>
        {
          BAR_TYPES.map(barType => (
            <label key={barType.value} className={styles.inputLabel}>
              <input
                checked={model.props.barType === barType.value}
                type="radio"
                name={`q_${model.id}_bar_type`}
                onChange={this.changeBarType}
                value={barType.value}
              />
              {' '}
              {`${barType.label}`}
            </label>
          ))
        }
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    return (
      <div>
        {this.renderTextPosition()}
        {this.renderSliderPosition()}
        {this.renderSliderMargin()}
        {this.renderCategory()}
        {this.renderModification()}
        {this.renderBarType()}
        {this.renderLabels()}
        <hr className={styles.divider} />
        {!restricted && (
          <RequiredValidations
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}

export default Properties
