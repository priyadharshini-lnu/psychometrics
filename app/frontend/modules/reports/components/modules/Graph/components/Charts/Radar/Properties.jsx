import { Component } from 'react'
import PropTypes from 'prop-types'
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

  changeRadarSize = (value) => {
    const { model } = this.props
    model.props.radarSize = `${value}%`
    this.update()
  }

  changeHideYaxisLabels = (e) => {
    const { model } = this.props
    model.props.hideYaxisLabels = e.currentTarget.checked
    this.update()
  }

  changeEmptyFilters = (e) => {
    const { model } = this.props
    model.props.hideEmptyFilters = e.currentTarget.checked
    this.update()
  }

  render () {
    const { model } = this.props
    const {
      radarMax, radarSize, tickInterval, startAngle,
    } = model.props
    return (
      <div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.hideYaxisLabels || false}
              onChange={this.changeHideYaxisLabels}
            />
            {' '}
            Hide Y Axis Labels
          </label>
        </div>
        <div className={styles.block}>
          <label style={{ fontWeight: 'normal' }}>
            <input
              type="checkbox"
              checked={model.props.hideEmptyFilters || false}
              onChange={this.changeEmptyFilters}
            />
            {' '}
            Hide Empty filters
          </label>
        </div>
        <div className={styles.block}>
          Radar Maximum
          <ChoicesInput
            value={radarMax}
            onChange={e => this.changeProperty('radarMax', e)}
            minValue={2}
            maxValue={30}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Radar Size
          <ChoicesInput
            value={parseInt(radarSize, 10)}
            onChange={this.changeRadarSize}
            minValue={50}
            maxValue={150}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Tick Interval
          <ChoicesInput
            value={tickInterval}
            onChange={e => this.changeProperty('tickInterval', e)}
            minValue={0}
            maxValue={5}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Start Angle
          <ChoicesInput
            value={startAngle || 0}
            onChange={e => this.changeProperty('startAngle', e)}
            minValue={0}
            maxValue={90}
          />
        </div>
      </div>
    )
  }
}

export default Properties
