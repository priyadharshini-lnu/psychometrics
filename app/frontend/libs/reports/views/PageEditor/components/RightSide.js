import React, { Component } from 'react'
import PageList from 'rb/views/PageList'
import store from 'rb/store/PageList'
import styles from './PageEditor.scss'

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
          <PageList />
        </div>
      </div>
    )
  }
}

export default PageEditor
