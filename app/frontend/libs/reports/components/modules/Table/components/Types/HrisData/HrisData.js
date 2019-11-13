import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Utils from 'rb/utils'
import ResultStore from 'rb/store/ResultStore'
import Table from '../../Table'
import styles from './HrisData.scss'

const MockData = [
  {
    name: 'Director',
    respondentCount: 30,
    invites: 100,
  },
  {
    name: 'Employee',
    respondentCount: 44,
    invites: 141,
  },
  {
    name: 'Administration',
    respondentCount: 12,
    invites: 15,
  },
]

class SingleQuestion extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  getRow = i => this.rowData[i]

  prepareRows () {
    const data = MockData
    const directors = { invites: 0, responds: 0 }
    const employees = { invites: 0, responds: 0 }
    const admins = { invites: 0, responds: 0 }
    const { module } = this.props
    if (ResultStore.realResults) {
      _.each(ResultStore.results[module.assessment_id].usersScoring, (user) => {
        if (user.hris.Division) {
          if (user.hris.Division === 'Director') {
            directors.invites += 1
            if (user.status === 'complete') {
              directors.responds += 1
            }
          }
        }
        if (user.hris.Division) {
          if (user.hris.Division === 'Employee') {
            employees.invites += 1
            if (user.status === 'complete') {
              employees.responds += 1
            }
          }
        }
        if (user.hris.Division) {
          if (user.hris.Division === 'Administration') {
            admins.invites += 1
            if (user.status === 'complete') {
              admins.responds += 1
            }
          }
        }
      })
      MockData[0].invites = directors.invites
      MockData[0].respondentCount = directors.responses
      MockData[1].invites = employees.invites
      MockData[1].respondentCount = employees.responses
      MockData[2].invites = admins.invites
      MockData[2].respondentCount = admins.responses
    }

    const columns = this.colData()
    const rowData = []
    _.each(data, (data, i) => {
      rowData[i] = rowData[i] || []
      _.each(columns, (column, j) => {
        rowData[i][j] = rowData[i][j] || {}
        _.merge(rowData[i][j], { type: column.dataType, value: data[column.name] || this.collBehavior(column, data) })
        if (column.visibility) {
          if (!_.result(module.props, column.visibility)) {
            rowData[i][j].visible = false
          } else {
            rowData[i][j].visible = true
          }
        }
      })
    })
    this.rowData = rowData
  }

  collBehavior (column, data) {
    switch (column.name) {
      case 'percentage':
        return this.percentageBehavior(data)
      default:
    }
  }

  percentageBehavior (data) {
    return `${Utils.round(data.respondentCount / data.invites * 100, 2)}%`
  }

  colData () {
    const { module: model } = this.props
    if (model.props.headerData) {
      return model.props.headerData
    }
    model.props.headerData = [
      {
        name: 'name', type: 'Label', dataType: 'Text', value: 'Division',
      },
      {
        name: 'respondentCount', type: 'Label', dataType: 'Text', value: 'Respondent Count',
      },
      {
        name: 'invites', type: 'Label', dataType: 'Text', value: 'Invitee count',
      },
      {
        name: 'percentage', type: 'Label', dataType: 'Text', value: 'Percentage', visibility: 'percentageColumn',
      },
    ]
    model.sync()

    return model.props.headerData
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
        />
      </div>
    )
  }
}

export default SingleQuestion
