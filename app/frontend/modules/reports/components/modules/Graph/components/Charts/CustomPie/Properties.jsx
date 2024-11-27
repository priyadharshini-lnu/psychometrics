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

  changeBorderWidth = (value) => {
    const { model } = this.props
    model.props.chartBorderWidth = `${value}px`
    this.update()
  }

  render () {
    const { model } = this.props
    const { chartBorderWidth, radarMax } = model.props
    return (
      <div>
        <div className="margin-bottom-10">Up to 4 items can be displayed</div>
        <hr className={styles.divider} />
        { model.props?.source?.type === 'CampaignFactors' ? (
          <>
            <div className={styles.block}>
              Radar Maximum
              <ChoicesInput
                value={radarMax}
                onChange={e => this.changeProperty('radarMax', e)}
                minValue={5}
                maxValue={100}
              />
            </div>
            <hr className={styles.divider} />
          </>
        ) : null}
        <div className={styles.block}>
          Pie Thickness
          <ChoicesInput
            value={parseInt(chartBorderWidth, 10)}
            onChange={this.changeBorderWidth}
            minValue={1}
            maxValue={30}
          />
        </div>
      </div>
    )
  }
}

export default Properties
