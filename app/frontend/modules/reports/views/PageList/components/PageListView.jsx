import { Component } from 'react'
import _ from 'lodash'
import store from '~/modules/reports/store/PageList'
import Page from '~/modules/reports/views/Page'
import styles from './PageListView.less'

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
          {report.name}
        </div>
        {_.map(pages, model => !model.removed && (
          <Page
            key={model.id}
            model={model}
            moduleIds={model.modules}
          />
        ))}
      </div>
    )
  }
}

export default PageListView
