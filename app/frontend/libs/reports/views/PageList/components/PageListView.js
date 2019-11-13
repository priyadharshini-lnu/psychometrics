import React, { Component } from 'react'
import store from 'rb/store/PageList'
import Page from 'rb/views/Page'
import LabelEditor from 'rb/components/LabelEditor'
import AppStore from 'rb/store/AppStore'
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
    AppStore.report.rename(val)
    this.forceUpdate()
  }

  unselectAllModules () {
    store.unselectAll()
  }

  render () {
    return (
      <div className={styles.main} onClick={this.unselectAllModules}>
        <div className={styles.reportName}>
          <LabelEditor value={AppStore.report.name || ''} onChange={this.changeName} width={650} />
        </div>
        {store.list.map((model, i) => !model.removed && model.visible
          && <Page key={i} model={model} renderModules={model.renderModules} />)}
      </div>
    )
  }
}

export default PageListView
