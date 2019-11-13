import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'rb/components/ChoicesInput'
import _ from 'lodash'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeColumnsCount = (val) => {
    const { model } = this.props
    model.props.columnsCount = val

    _.each(model.props.rowData, (row) => {
      row.splice(val, row.length)
      _.times(val, (i) => {
        row[i] = row[i] || {}
      })
    })

    model.update()
    this.forceUpdate()
  }

  changeRowsCount = (val) => {
    const { model, model: { props } } = this.props
    props.rowsCount = val
    props.rowData.splice(val, model.props.rowData.length)

    _.times(val, (i) => {
      props.rowData[i] = props.rowData[i] || _.times(props.columnsCount, () => ({}))
    })

    model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = this.props

    return (
      <div>
        <div className={styles.title}>Simple Table Props</div>
        <div className={styles.block}>
          Columns count
          <ChoicesInput value={model.props.columnsCount} onChange={this.changeColumnsCount} maxValue={100} />
        </div>
        <div className={styles.block}>
          Rows count
          <ChoicesInput value={model.props.rowsCount} onChange={this.changeRowsCount} maxValue={1000} />
        </div>
      </div>
    )
  }
}

export default Properties
