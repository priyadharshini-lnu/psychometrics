import { Component } from 'react'
import PropTypes from 'prop-types'
import { Slider } from 'antd'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

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

  changeValuePadding = (value) => {
    const { model } = this.props
    model.props.valuePadding = value
    this.forceUpdate()
  }

  updateValuePadding = () => {
    this.update()
  }

  render () {
    const { model } = this.props
    const { radarMax, numberOfDecimals, valuePadding } = model.props
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
        <hr className={styles.divider} />
        <div className={styles.block}>
          Values Padding
          {' '}
          {valuePadding || 0}
          <Slider
            defaultValue={0}
            min={-50}
            max={50}
            value={valuePadding}
            onChange={this.changeValuePadding}
            onAfterChange={this.updateValuePadding}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
