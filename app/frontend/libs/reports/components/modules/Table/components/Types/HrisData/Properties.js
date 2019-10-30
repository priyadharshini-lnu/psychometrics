import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changePercentage = () => {
    const { model } = this.props
    model.props.percentageColumn = !model.props.percentageColumn
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = this.props

    return (
      <div>
        <div className={styles.title}>HRIS Data Table Props</div>
        <div className={styles.block}>
          <div className="margin-top-10">
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={model.props.percentageColumn || false}
                onChange={this.changePercentage}
              />
              Percentage Column
            </label>
          </div>
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
