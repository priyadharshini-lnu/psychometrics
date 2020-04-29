import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFonts from 'rb/components/PropertyFonts'
import _ from 'lodash'
import Select from 'react-select'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

const SELECT_OPTIONS = _.times(30, i => ({
  value: i + 1,
  label: `top ${i + 1}`,
}))

class Properties extends Component {
  update = () => {
    const { model } = this.props
    model.props.group = null
    model.update()
  }

  changeTopPosition = (e) => {
    const { model } = this.props
    model.props.topPosition = e ? e.value : null
    model.update()
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
        <div>Font</div>
        <PropertyFonts colors={false} />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
