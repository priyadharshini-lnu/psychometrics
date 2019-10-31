import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import store from 'rb/store/PropertyPanelStore'
import AppStore from 'rb/store/AppStore'
import Action from 'rb/undo'
import { PAGE_SIZES } from 'rb/models/Report'
import PageList from 'rb/store/PageList'

class ReportProperties extends Component {
  changeType = (type, props = {}) => {
    if (store.question.type === type) { return }
    Action('QuestionChangeType', store.question, { oldType: store.question.type, newType: type })
    store.question.changeType(type, props)
    store.update()
  }

  changePageSize = ({ target }) => {
    const { report } = AppStore
    const size = PAGE_SIZES.find(size => size.label === target.value)
    // TODO (atanych): should be handler via redux actions
    report.props.sizes.width = size.width
    report.props.sizes.height = size.height
    PageList.update()
    this.forceUpdate()
  }

  render () {
    if (!AppStore.report.id) { return null }
    return (
      <div>
        <div className={styles.title}>Report Options</div>
        <hr className={styles.divider} />
        <div>
          Page size
          <select value={AppStore.report.getPageSizeLabel()} onChange={this.changePageSize} className="form-control">
            {PAGE_SIZES.map(({ label }) => <option key={label} value={label}>{label}</option>)}
          </select>
        </div>
      </div>
    )
  }
}

export default ReportProperties
