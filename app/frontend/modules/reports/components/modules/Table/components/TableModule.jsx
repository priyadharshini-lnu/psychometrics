import { Component } from 'react'
import PropTypes from 'prop-types'
import Foundation from '~/modules/reports/components/Foundation'
import styles from './TableModule.less'
import Types from './Types'
import { joinStyles } from '../../CommonMethods/styles'

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
    const { preview, module, reportStyles } = this.props
    const style = joinStyles(reportStyles, module.props.styleIds)

    const outerStyle = {}
    outerStyle.borderRadius = style.borderRadius

    if (style.boxShadow?.enabled) {
      const {
        x, y, blur, spread = 0, color = '#000000',
      } = style.boxShadow
      outerStyle.boxShadow = `${x || 0}px ${y || 0}px ${blur || 0}px ${spread || 0}px ${color}`
    }

    return (
      <Foundation {...this.props} preview={preview} outerStyle={outerStyle}>
        <div className={styles.table}>
          {this.renderTableType()}
        </div>
      </Foundation>
    )
  }
}

export default TableModule
