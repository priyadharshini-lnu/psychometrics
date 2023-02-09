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

  changeBorderWidth = (value) => {
    const { model } = this.props
    model.props.chartBorderWidth = `${value}px`
    this.update()
  }

  render () {
    const { model } = this.props
    const { chartBorderWidth } = model.props
    return (
      <div>
        <div className="margin-bottom-10">Up to 4 items can be displayed</div>
        <hr className={styles.divider} />
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
