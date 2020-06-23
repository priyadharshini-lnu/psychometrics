import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import { PAGE_SIZES } from 'rb/models/Report'
import connect from './connect'

class ReportProperties extends Component {
  changePageSize = ({ target }) => {
    const { changeSize, report } = this.props
    const size = PAGE_SIZES.find(size => size.label === target.value)
    changeSize({ width: size.width, height: size.height, fontSize: report.props.sizes.fontSize })
  }

  getPageSizeLabel = (report) => {
    const size = PAGE_SIZES.find(
      ({ width, height }) => width === report.props.sizes.width && height === report.props.sizes.height,
    )
    return size.label
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
          <select value={this.getPageSizeLabel(report)} onChange={this.changePageSize} className="form-control">
            {PAGE_SIZES.map(({ label }) => <option key={label} value={label}>{label}</option>)}
          </select>
        </div>
      </div>
    )
  }
}

export default connect(ReportProperties)
