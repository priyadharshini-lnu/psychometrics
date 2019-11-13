import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import Table from '../../Table'
import styles from './ResponseSummary.scss'

const ROWS = [
  {
    name: 'Number of evaluators invited',
    key: 'invited',
  },
  {
    name: 'Number of evaluators received',
    key: 'complete',
  },
  {
    name: 'Number of Direct Report evaluators received',
    key: 'direct',
  },
  {
    name: 'Number of Peer evaluators received',
    key: 'peer',
  },
  {
    name: 'Number of Direct Managers evaluators received',
    key: 'manager',
  },
]

class ResponseSummary extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  getRow = i => this.rowData[i]

  prepareRows () {
    const { module } = this.props
    const columns = this.colData()
    const rowData = module.props.rowData || []

    _.each(ROWS, (data, i) => {
      rowData[i] = rowData[i] || []
      _.each(columns, (column, j) => {
        rowData[i][j] = rowData[i][j] || {}
        _.merge(rowData[i][j], {
          type: column.dataType,
          value: data[column.name] || this.collBehavior(column, data),
          styles: {
            backgroundColor: '#eee',
            color: '#000',
            width: '90%',
          },
        })
        if (column.visibility) {
          if (!_.result(module.props, column.visibility)) {
            rowData[i][j].visible = false
          } else {
            rowData[i][j].visible = true
          }
        }
      })
    })
    module.props.rowData = rowData
    this.rowData = rowData
  }

  collBehavior (column, data) {
    switch (column.name) {
      case 'respondentCount':
        return this.respondentCountBehavior(data)
      default:
    }
  }

  respondentCountBehavior (data) {
    const { module } = this.props
    const assigns = AppStore.report.assigns[module.assessment_id]
    let count = 0
    switch (data.key) {
      case 'invited':
        return assigns.length
      case 'complete':
        _.each(assigns, assign => assign.status === 'completed')
        return count
      case 'direct':
        _.each(assigns, (assign) => {
          if (assign.status === 'completed' && assign.status === 'Direct Report') {
            count += 1
          }
        })
        return count
      case 'peer':
        _.each(assigns, (assign) => {
          if (assign.status === 'completed' && assign.relationship === 'Peer') {
            count += 1
          }
        })
        return count
      case 'manager':
        _.each(assigns, (assign) => {
          if (assign.status === 'completed' && assign.relationship === 'Manager') {
            count += 1
          }
        })
        return count
      default:
        return '-'
    }
  }

  colData () {
    const { module } = this.props
    if (module.props.headerData) {
      return module.props.headerData
    }
    module.props.headerData = [
      {
        name: 'name', type: 'Text', dataType: 'Text', value: '',
      },
      {
        name: 'respondentCount', type: 'Text', dataType: 'Text', value: '',
      },
    ]
    module.sync()

    return module.props.headerData
  }

  render () {
    const { module: model } = this.props
    this.prepareRows()

    return (
      <div className={styles.table}>
        <Table
          module={model}
          rowsCount={this.rowData.length}
          colData={this.colData()}
          getRow={this.getRow}
          showHedaer={false}
        />
      </div>
    )
  }
}

export default ResponseSummary
