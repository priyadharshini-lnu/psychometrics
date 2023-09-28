import { Component } from 'react'
import PropTypes from 'prop-types'
import DataSource from '~/modules/reports/components/DataSourceMenu'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeHeader = () => {
    const { model } = this.props
    model.props.showHeader = !model.props.showHeader
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <div className={styles.title}>Single Value Scoring</div>
        <DataSource model={model} onSelect={this.update} />
        <PropertyFilter model={model} />
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
