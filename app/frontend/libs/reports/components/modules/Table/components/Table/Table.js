import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './Table.scss'
import CellTypes from './CellTypes'

class Table extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    colData: PropTypes.array.isRequired,
    getRow: PropTypes.func.isRequired,
    rowsCount: PropTypes.number.isRequired,
    showHedaer: PropTypes.bool,
  }

  defaultProps = {
    showHedaer: true,
  }

  renderCell = (data, key) => {
    const { module } = this.props
    if (!data) { return null }
    if (data.visible === false) { return null }
    const Cell = CellTypes[data.type] || CellTypes.Text
    if (data.visibility) {
      if (!_.result(module.props, data.visibility)) {
        return null
      }
    }
    return <Cell key={key} idx={key} module={module} model={data} title={!!data.head} />
  }

  renderRow = (i) => {
    const { getRow } = this.props
    return (
      <tr key={i}>
        {getRow(i).map(this.renderCell)}
      </tr>
    )
  }

  renderHeadingRow = colData => (
    <tr>
      {colData.map(this.renderCell)}
    </tr>
  )

  render () {
    const {
      rowsCount, colData, showHedaer,
    } = this.props
    return (
      <div className={styles.table}>
        <table className={styles.content}>
          <tbody>
            {showHedaer && colData.length > 0 && this.renderHeadingRow(colData)}
            {_.times(rowsCount, this.renderRow)}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Table
