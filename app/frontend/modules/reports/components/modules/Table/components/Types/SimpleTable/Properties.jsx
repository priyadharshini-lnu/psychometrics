import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

class Properties extends Component {
  static propTypes = {
    modules: PropTypes.array,
  }

  changeColumnsCount = (val) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.columnsCount = val

      _.each(model.props.rowData, (row) => {
        row.splice(val, row.length)
        _.times(val, (i) => {
          row[i] = row[i] || {}
        })
      })

      model.update()
    })
  }

  changeRowsCount = (val) => {
    const { modules } = this.props
    modules.forEach((model) => {
      const { props } = model
      props.rowsCount = val
      props.rowData.splice(val, model.props.rowData.length)

      _.times(val, (i) => {
        props.rowData[i] = props.rowData[i] || _.times(props.columnsCount, () => ({}))
      })

      model.update()
    })
  }

  render () {
    const { modules } = this.props
    const model = modules[0]

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
