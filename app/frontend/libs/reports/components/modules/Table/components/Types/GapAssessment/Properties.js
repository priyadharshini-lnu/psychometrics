import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

export default class Properties extends Component {
  onChange = (key, value) => {
    store.model.props[key] = value
    store.model.update()
    this.forceUpdate()
  }

  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
    return (
      <div>
        <div className={styles.title}>Gap Assessment</div>
        <PropertyFilter />
        <div style={{ fontStyle: 'italic' }}>2 filters should be selected for comparison</div>
        <hr className={styles.divider} />
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <hr className={styles.divider} />
      </div>
    )
  }
}
