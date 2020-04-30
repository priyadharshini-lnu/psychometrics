import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'

class Properties extends Component {
  update = () => {
    const { model } = this.props
    model.update()
  }

  changeHeader = () => {
    const { model } = this.props
    model.props.showHeader = !model.props.showHeader
    model.update()
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
