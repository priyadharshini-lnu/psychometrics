import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PageList from 'rb/store/PageList'
import ClipboardDispatcher from 'rb/dispatchers/ClipboardDispatcher'
import connect from './connect'

class PageProperties extends Component {
  removePage = () => {
    const { page, removePage } = this.props
    removePage(page.id)
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
    const { page, report } = this.props
    if (!page) { return }
    return (
      <div>
        <div className={styles.title}>Page Options</div>
        <hr className={styles.divider} />
        <div>{page.name}</div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={this.removePage} className="btn btn-default">Remove</button>
        </div>

        {/* <div>Clipboard: </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={this.copyPage} className="btn btn-default">Copy</button>
          <button onClick={this.pastePage} className="btn btn-default">Paste</button>
        </div> */}
      </div>
    )
  }
}

export default connect(PageProperties)
