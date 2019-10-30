import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'

class Properties extends Component {
  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  changeHeader = () => {
    store.model.props.showHeader = !store.model.props.showHeader
    store.model.update()
    this.forceUpdate()
  }

  render () {
    return (
      <div>
        <div className={styles.title}>Gap Assessment Scoring</div>
        <PropertyFilter />
        <div style={{ fontStyle: 'italic' }}>2 filters should be selected for comparison</div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
