import { Component } from 'react'
import _ from 'lodash'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { PAGE_SIZES, ALL_PAGE_SIZES } from '~/modules/reports/models/Report'
import connect from './connect'

class ReportProperties extends Component {
  currentSize = () => {
    const { report } = this.props
    return ALL_PAGE_SIZES.find(
      ({ width, height }) => width === report.props.sizes.width && height === report.props.sizes.height,
    )
  }

  getPageSizeLabel = () => this.currentSize().label

  changePageSize = ({ target }) => {
    const { changeSize, report } = this.props
    const size = PAGE_SIZES.find(size => size.label === target.value)
    changeSize({ width: size.width, height: size.height, fontSize: report.props.sizes.fontSize })
  }

  render () {
    const { report } = this.props
    if (!report.id) { return null }
    return (
      <div>
        <div className={styles.title}>Report Options</div>
        <hr className={styles.divider} />
        <div>
          Page size
          <select value={this.getPageSizeLabel()} onChange={this.changePageSize} className="form-control">
            {_.uniqBy([...PAGE_SIZES, this.currentSize()], 'width').map(({ label }) => (
              <option key={label} value={label}>{label}</option>))}
          </select>
        </div>
      </div>
    )
  }
}

export default connect(ReportProperties)
