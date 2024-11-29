import { Component } from 'react'
import PageList from '~/modules/reports/views/PageList'
import store from '~/modules/reports/store/PageList'
import styles from './PageEditor.less'
import SelectionFrame from '~/modules/reports/components/SelectionFrame'

export class PageEditor extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
  }

  update = () => {
    this.forceUpdate()
  }

  componentWillUnmoun () {
    this.storeListener.remove()
  }

  render () {
    return (
      <div className={styles.rightSide}>
        <div className={styles.reportContainer}>
          <SelectionFrame>
            <PageList />
          </SelectionFrame>
        </div>
      </div>
    )
  }
}

export default PageEditor
