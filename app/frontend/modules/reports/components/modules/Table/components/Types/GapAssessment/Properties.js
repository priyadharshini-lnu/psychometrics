import React, { Component } from 'react'
import Select from 'react-select'

import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

export const GAP_TYPES = {
  ALL: 0,
  POSITIVE: 1,
  NEGATIVE: 2,
}

const GAP_TYPE_OPTIONS = [
  {
    label: 'All',
    value: GAP_TYPES.ALL,
  },
  {
    label: 'Positive',
    value: GAP_TYPES.POSITIVE,
  },
  {
    label: 'Negative',
    value: GAP_TYPES.NEGATIVE,
  },
]

export default class Properties extends Component {
  onChange = (key, value) => {
    const { model } = this.props
    model.props[key] = value
    model.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  render () {
    const { model } = this.props
    const value = _.get(model, ['props', 'gapType'], 0)
    return (
      <div>
        <div className={styles.title}>Gap Assessment</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <hr className={styles.divider} />
        <PropertyFilter model={model} />
        <div style={{ fontStyle: 'italic' }}>2 filters should be selected for comparison</div>
        <hr className={styles.divider} />
        <Select
          value={getValue(GAP_TYPE_OPTIONS, value)}
          options={GAP_TYPE_OPTIONS}
          isSearchable={false}
          onChange={option => this.onChange('gapType', option.value)}
        />
      </div>
    )
  }
}
