import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

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
    return (
      <div>
        <div className={styles.title}>Gap Assessment</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <hr className={styles.divider} />
        <PropertyFilter />
        <div style={{ fontStyle: 'italic' }}>2 filters should be selected for comparison</div>
        <hr className={styles.divider} />
      </div>
    )
  }
}
