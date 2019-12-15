import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
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
    store.model.props.group = null
    store.model.update()
    this.forceUpdate()
  }

  changeTopPosition = (e) => {
    store.model.props.topPosition = e ? e.value : null
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
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
