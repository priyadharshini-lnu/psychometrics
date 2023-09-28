import { Component } from 'react'
import PropTypes from 'prop-types'
import css from './DataSheet.less'
import ConditionSelect from './ConditionSelect'
import DataSheetSelect from './DataSheetSelect'

export default class DataSheet extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  change = (cond) => {
    const { condition } = this.props
    condition.setProps(cond)
    this.forceUpdate()
  }

  render () {
    const { condition, dataSheetColumns } = this.props
    return (
      <div className={css.datasheet}>
        <div className={css.container}>
          <div className={css.datasheetBlock}>
            <DataSheetSelect dataSheetColumns={dataSheetColumns} condition={condition} onChange={this.change} />
          </div>
          <ConditionSelect condition={condition} onChange={this.change} />
        </div>
      </div>
    )
  }
}
