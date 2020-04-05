import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import store from 'rb/store/PropertyPanelStore'
import PageList from 'rb/store/PageList'
import ClipboardDispatcher from 'rb/dispatchers/ClipboardDispatcher'
import conenct from './connect'

class PageProperties extends Component {
  removePage = () => {
    const { removePage } = this.props
    removePage(store.model.id)
  }

  copyPage = () => {
    ClipboardDispatcher.copyPage(store.model)
  }

  pastePage = () => {
    ClipboardDispatcher.pastePage(store.model)
  }

  render () {
    const { model } = store
    return (
      <div>
        <div className={styles.title}>Page Options</div>
        <hr className={styles.divider} />
        <div>{model.name}</div>
        <div style={{ textAlign: 'center' }}>
          {PageList.list.length > 1 && <button onClick={this.removePage} className="btn btn-default">Remove</button>}
        </div>

        <div>Clipboard: </div>
        <div style={{ textAlign: 'center' }}>
          {PageList.list.length > 1 && <button onClick={this.copyPage} className="btn btn-default">Copy</button>}
          {PageList.list.length > 1 && <button onClick={this.pastePage} className="btn btn-default">Paste</button>}
        </div>
      </div>
    )
  }
}

export default conenct(PageProperties)
