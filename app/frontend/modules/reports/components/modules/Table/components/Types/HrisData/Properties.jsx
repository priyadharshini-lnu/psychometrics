import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'

class Properties extends Component {
  static propTypes = {
    modules: PropTypes.array.isRequired,
  }

  changePercentage = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.percentageColumn = !model.props.percentageColumn
      model.update()
    })
    this.forceUpdate()
  }

  render () {
    const { modules } = this.props
    const model = modules[0]

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
