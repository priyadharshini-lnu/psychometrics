import { Component } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import Module from '~/modules/reports/models/Module'
import connect from './connect'

class PageProperties extends Component {
  removePage = () => {
    const { page, removePage } = this.props
    removePage(page.id)
  }

  copyPage = () => {
    const { page, copyPage } = this.props
    copyPage(page.id)
  }

  pastePage = () => {
    const { page, pastePage, bufferPage } = this.props
    if (!bufferPage) {
      // eslint-disable-next-line no-alert
      return alert('Nothing to paste')
    }
    const modules = bufferPage.modules.map((m) => {
      const data = JSON.parse(JSON.stringify(m))
      data.id = null
      return new Module(data, page)
    })
    // eslint-disable-next-line no-alert
    if (page.modules.length && !confirm('Are u sure? This action will replace modules on page.')) {
      return
    }
    pastePage(page.id, modules)
  }

  render () {
    const { page } = this.props
    if (!page) { return }

    return (
      <div>
        <div className={styles.title}>Page Options</div>
        <hr className={styles.divider} />
        <div>{page.name}</div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={this.removePage} className="btn btn-default">Remove</button>
        </div>

        <div>Clipboard: </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={this.copyPage} className="btn btn-default">Copy</button>
          <button onClick={this.pastePage} className="btn btn-default">Paste</button>
        </div>
      </div>
    )
  }
}

export default connect(PageProperties)
