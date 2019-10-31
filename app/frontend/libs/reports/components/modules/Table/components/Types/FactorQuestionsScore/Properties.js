import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DataSource from 'rb/components/DataSourceMenu'
import store from 'rb/store/PropertyPanelStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

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
    const { model } = store
    const { model: pmodel } = this.props
    return (
      <div>
        <div className={styles.title}>Factor - Questions Mean Score Props</div>
        <DataSource model={pmodel} onSelect={this.update} />
        <PropertyFilter />
        <div className={styles.block}>
          <div className="margin-top-10">
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={model.props.showHeader || false}
                onChange={this.changeHeader}
              />
              Show Header
            </label>
          </div>
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
