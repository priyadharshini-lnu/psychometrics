import _ from 'lodash'
import { Component } from 'react'
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import styles from './PropertyFilter.less'

const SKIPPED_QUESTION_TYPES_FOR_MULTIFILTERING = ['PickGroupRank', 'MatrixTable', 'HotSpot']
class PropertyFilter extends Component {
  static propTypes = {}

  changeFilter = (filter) => {
    const { model } = this.props
    if (model.isMultiFiltering()) {
      if (filter) {
        model.props.filter = _.map(filter, f => f.value)
      } else {
        model.props.filter = []
      }
    } else {
      model.props.filter = filter ? filter.value : null
    }
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    const showDesc = model.isMultiFiltering()
      && _.indexOf(SKIPPED_QUESTION_TYPES_FOR_MULTIFILTERING, model.getSourceType()) !== -1
    const SELECT_OPTIONS = _.map(AppStore.report.filters, filter => ({ label: filter.name, value: filter.id }))
    return (
      <div>
        <div>Filter</div>
        {showDesc && (
        <div
          className={styles.description}
        >
          Not available for this question type. The result on the chart will be displayed only for the first filter.
        </div>
        )}
        <Select
          name="form-field-name"
          value={getValue(SELECT_OPTIONS, model.props.filter)}
          options={SELECT_OPTIONS}
          autoFocus={false}
          getOptionValue={opt => opt.value}
          getLabelValue={opt => opt.label}
          hideSelectedOptions
          isMulti={model.isMultiFiltering()}
          onChange={this.changeFilter}
          placeholder="All Responses"
        />
      </div>
    )
  }
}

export default PropertyFilter
