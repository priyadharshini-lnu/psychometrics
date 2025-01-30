import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './SimpleTable.less'
import Table from '../../Table'

class SimpleTable extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  componentWillMount () {
    const { module } = this.props
    const { columnsCount, rowsCount } = module.props
    module.props.rowData = module.props.rowData || []

    _.times(rowsCount, (i) => {
      module.props.rowData[i] = module.props.rowData[i] || []
      _.times(columnsCount, (j) => {
        module.props.rowData[i][j] = module.props.rowData[i][j] || {}
      })
    })
    module.update()
  }

  getRow = (i) => {
    const { module } = this.props
    return module.props.rowData[i]
  }

  render () {
    const { module } = this.props
    const { fontFamily, fontSize, fontColor } = module.props.style
    const styleProp = { fontFamily, fontSize, color: fontColor }
    if (!module.props.rowData) { return }
    return (
      <div className={styles.table} style={styleProp}>
        <Table
          module={module}
          rowsCount={module.props.rowData.length}
          colData={[]}
          getRow={this.getRow}
        />
      </div>
    )
  }
}

export default SimpleTable
