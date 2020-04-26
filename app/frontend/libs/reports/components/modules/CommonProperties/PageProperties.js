import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PageList from 'rb/store/PageList'
import ClipboardDispatcher from 'rb/dispatchers/ClipboardDispatcher'
import connect from './connect'

class PageProperties extends Component {
  removePage = () => {
    const { module, removePage } = this.props
    removePage(module.id)
  }

  copyPage = () => {
    const { module } = this.props
    ClipboardDispatcher.copyPage(module)
  }

  pastePage = () => {
    const { module } = this.props
    ClipboardDispatcher.pastePage(module)
  }

  render () {
    const { module } = this.props
    return (
      <div>
        <div className={styles.title}>Page Options</div>
        <hr className={styles.divider} />
        <div>{module.name}</div>
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

export default connect(PageProperties)
