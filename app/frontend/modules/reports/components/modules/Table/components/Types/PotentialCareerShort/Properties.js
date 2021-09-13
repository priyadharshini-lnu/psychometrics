import React, { Component } from 'react'
import styles from 'modules/reports/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFonts from 'modules/reports/components/PropertyFonts'
import _ from 'lodash'
import Select from 'react-select'
import ColorPicker from 'modules/reports/components/ColorPicker'
import { getValue } from 'modules/reports/presenters/ReactSelectPresenter'

const SELECT_OPTIONS = _.times(30, i => ({
  value: i + 1,
  label: `top ${i + 1}`,
}))

class Properties extends Component {
  changeTopPosition = (e) => {
    const { model } = this.props
    model.props.topPosition = e ? e.value : null
    model.update()
    this.forceUpdate()
  }

  changeBackgroundColor = (color) => {
    const { model } = this.props
    model.props.style.backgroundColor = color.hex
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <span className={styles.label}>Top Position</span>
        <Select
          name="form-field-name"
          value={getValue(SELECT_OPTIONS, model.props.topPosition)}
          options={SELECT_OPTIONS}
          getOptionValue={opt => opt.value}
          onChange={this.changeTopPosition}
        />
        <hr className={styles.divider} />
        <div className={styles.block}>
          Background color
          <ColorPicker
            color={model.props.style.backgroundColor || '#ccc'}
            onChange={this.changeBackgroundColor}
          />
        </div>
        <hr className={styles.divider} />
        <div>Font</div>
        <PropertyFonts model={model} colors={false} />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
