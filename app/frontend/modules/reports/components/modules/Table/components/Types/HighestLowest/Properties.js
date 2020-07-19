import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import DataSourceMenu from '../../DataSourceMenu'

export default class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  render () {
    const { model } = this.props
    return (
      <div className="ptl">
        <div className={styles.title}>HighestLowest - Properties</div>
        <DataSourceMenu model={model} onSelect={this.update} />
        <PropertyFilter model={model} />
        <hr className={styles.divider} />
      </div>
    )
  }
}
