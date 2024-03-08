import { Component } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import Module from '~/modules/reports/models/Module'
import connect from './connect'
import { escapeSpecialChars } from '~/utils/string'

class PageProperties extends Component {
  removePage = () => {
    const { page, removePage } = this.props
    removePage(page.id)
  }

  copyPage = () => {
    if (!navigator.clipboard) { return }

    const { page } = this.props
    const data = {
      type: 'Page',
      data: { page },
    }
    navigator.clipboard.writeText(escapeSpecialChars(JSON.stringify(data)))
  }

  pastePage = () => {
    if (!navigator.clipboard) { return }

    const { page, pastePage, report } = this.props
    navigator.clipboard.readText().then((text) => {
      try {
        const data = JSON.parse(text)
        if (data.type !== 'Page') { return }
        const modules = data.data.page.modules.map((m) => {
          const data = JSON.parse(JSON.stringify(m))
          data.id = null
          data.assessment_id = report.assessments[m.assessment_id] ? m.assessment_id : null
          return new Module(data, page)
        })

        // eslint-disable-next-line no-alert
        if (page.modules.length && !confirm('Are u sure? This action will replace modules on page.')) {
          return
        }
        pastePage(page.id, modules)
      } catch (e) { /* empty */ }
    })
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
