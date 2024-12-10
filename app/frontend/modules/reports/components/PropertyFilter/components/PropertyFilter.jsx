import _ from 'lodash'
import Select from 'react-select'
import PropTypes from 'prop-types'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import styles from './PropertyFilter.less'

const SKIPPED_QUESTION_TYPES_FOR_MULTIFILTERING = ['PickGroupRank', 'MatrixTable', 'HotSpot']

const PropertyFilter = ({ modules, model = modules[0] }) => {
  const changeFilter = (filter) => {
    modules.forEach((item) => {
      if (item.isMultiFiltering()) {
        item.props.filter = filter ? _.map(filter, f => f.value) : []
      } else {
        item.props.filter = filter ? filter.value : null
      }
      item.update()
    })
  }

  const showDesc = model.isMultiFiltering()
    && _.indexOf(SKIPPED_QUESTION_TYPES_FOR_MULTIFILTERING, model.getSourceType()) !== -1

  const SELECT_OPTIONS = _.map(AppStore.report.filters, filter => ({
    label: filter.name,
    value: filter.id,
  }))

  return (
    <div>
      <div>Filter</div>
      {showDesc && (
        <div className={styles.description}>
          Not available for this question type. The result on the chart will be displayed only for the first filter.
        </div>
      )}
      <Select
        name="form-field-name"
        value={getValue(SELECT_OPTIONS, model.props.filter)}
        options={SELECT_OPTIONS}
        autoFocus={false}
        getOptionValue={opt => opt.value}
        getOptionLabel={opt => opt.label}
        hideSelectedOptions
        isMulti={model.isMultiFiltering()}
        onChange={changeFilter}
        placeholder="All Responses"
      />
    </div>
  )
}

PropertyFilter.propTypes = {
  modules: PropTypes.array,
  model: PropTypes.object,
}

export default PropertyFilter
