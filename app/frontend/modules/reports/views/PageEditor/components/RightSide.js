import React, { Component } from 'react'
import PageList from 'modules/reports/views/PageList'
import store from 'modules/reports/store/PageList'
import styles from './PageEditor.scss'

export class PageEditor extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
  }

  storeListener = null

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
          <PageList />
        </div>
      </div>
    )
  }
}

export default PageEditor
