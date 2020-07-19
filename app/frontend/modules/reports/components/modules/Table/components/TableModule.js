import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Foundation from 'rb/components/Foundation'
import styles from './TableModule.scss'
import Types from './Types'

class TableModule extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    preview: PropTypes.bool,
  }

  renderTableType () {
    const { module } = this.props
    const View = Types[module.props.type] || Types.SimpleTable
    return <View {...this.props} model={module} />
  }

  render () {
    const { preview } = this.props
    return (
      <Foundation {...this.props} preview={preview}>
        <div className={styles.table}>
          {this.renderTableType()}
        </div>
      </Foundation>
    )
  }
}

export default TableModule
