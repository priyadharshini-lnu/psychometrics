import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'rb/components/ChoicesInput'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeProperty = (propertyName, value) => {
    const { model } = this.props
    model.props[propertyName] = value
    this.update()
  }

  changeNumberOfDecimals = (value) => {
    const { model } = this.props
    model.props.numberOfDecimals = value
    this.update()
  }

  render () {
    const { model } = this.props
    const { radarMax, numberOfDecimals } = model.props
    return (
      <div>
        <div className={styles.block}>
          Radar Maximum
          <ChoicesInput
            value={radarMax}
            onChange={e => this.changeProperty('radarMax', e)}
            minValue={5}
            maxValue={10}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Number of Decimals
          <ChoicesInput
            maxValue={3}
            value={numberOfDecimals}
            onChange={this.changeNumberOfDecimals}
          />
        </div>
      </div>
    )
  }
}

export default Properties
