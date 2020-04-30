import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DataSource from 'rb/components/DataSourceMenu'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

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
    const { model } = this.props
    return (
      <div>
        <div className={styles.title}>Factor - Questions Mean Score Props</div>
        <DataSource model={model} onSelect={this.update} />
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
