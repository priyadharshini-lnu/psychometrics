import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import dataSources from './dataSources'

export default class Properties extends Component {
  onChange = (key, value) => {
    store.model.props[key] = value
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
    const DataSource = dataSources[model.props.sourceType]

    return (
      <div>
        <div className={styles.title}>Single Value</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <DataSource model={model} onChange={this.onChange} />
        <div className="mtm">
          <PropertyFilter />
        </div>
      </div>
    )
  }
}
