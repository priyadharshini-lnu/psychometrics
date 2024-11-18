import { Component } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import PropertyPagination from '~/modules/reports/components/PropertyPagination'
import connect from './connect'

class Properties extends Component {
  openConditionModal = () => {
    const { modules, openInnovationStyleCondition } = this.props
    openInnovationStyleCondition({ modules })
  }

  render () {
    const { modules } = this.props
    return (
      <div>
        <div style={{ width: '100%' }} onClick={this.openConditionModal} className="btn btn-default margin-bottom-10">
          Manage conditions
        </div>
        <div>Font</div>
        <PropertyFonts modules={modules} colors={false} />
        <hr className={styles.divider} />
        <PropertyPagination modules={modules} />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
