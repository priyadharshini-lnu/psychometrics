import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFonts from 'rb/components/PropertyFonts'
import PropertyPagination from 'rb/components/PropertyPagination'
import store from 'rb/store/PropertyPanelStore'
import connect from './connect'

class Properties extends Component {
  openConditionModal = () => {
    const { openInnovationStyleCondition } = this.props
    openInnovationStyleCondition({ module: store.model })
  }

  render () {
    return (
      <div>
        <div style={{ width: '100%' }} onClick={this.openConditionModal} className="btn btn-default margin-bottom-10">
          Manage conditions
        </div>
        <div>Font</div>
        <PropertyFonts colors={false} />
        <hr className={styles.divider} />
        <PropertyPagination />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
