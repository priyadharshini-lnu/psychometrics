import React, { Component } from 'react'
import store from 'rb/store/PageList'
import Page from 'rb/views/Page'
import PageModel from 'rb/models/Page'
import LabelEditor from 'rb/components/LabelEditor'
import styles from './PageListView.scss'

export class PageListView extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  update = () => {
    this.forceUpdate()
  }

  changeName = (val) => {
    const { renameReport } = this.props
    renameReport(val)
  }

  unselectAllModules = () => {
    const { selectModule } = this.props
    selectModule('Report', store)
  }

  render () {
    const { pages, report } = this.props
    return (
      <div className={styles.main} onClick={this.unselectAllModules}>
        <div className={styles.reportName}>
          <LabelEditor value={report.name || ''} onChange={this.changeName} width={650} />
        </div>
        {_.map(pages, (model, i) => {
          const page = new PageModel(model, report.completed_assessments)
          return !page.removed && page.visible
          && (
            <Page
              key={page.id}
              model={page}
              moduleIds={model.modules}
              renderModules={page.renderModules}
            />
          )
        })}
      </div>
    )
  }
}

export default PageListView
