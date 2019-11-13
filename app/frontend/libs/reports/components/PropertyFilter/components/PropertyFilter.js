import _ from 'lodash'
import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import AppStore from 'rb/store/AppStore'
import FilterStore from 'rb/store/modals/FilterStore'
import Select from 'react-select'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import styles from './PropertyFilter.scss'

const SKIPPED_QUESTION_TYPES_FOR_MULTIFILTERING = ['PickGroupRank', 'MatrixTable', 'HotSpot']
class PropertyFilter extends Component {
  static propTypes = {}

  componentDidMount () {
    this.filterListener = FilterStore.addListener('change', () => this.forceUpdate())
    this.propPanelListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.filterListener.remove()
    this.propPanelListener.remove()
  }

  changeFilter = (filter) => {
    if (store.model.isMultiFiltering()) {
      if (filter) {
        store.model.props.filter = _.map(filter, f => f.value)
      } else {
        store.model.props.filter = []
      }
    } else {
      store.model.props.filter = filter ? filter.value : null
    }
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const showDesc = store.model.isMultiFiltering()
      && _.indexOf(SKIPPED_QUESTION_TYPES_FOR_MULTIFILTERING, store.model.getSourceType()) !== -1
    const SELECT_OPTIONS = _.map(AppStore.report.filters, filter => ({ label: filter.name, value: filter.id }))
    console.log(SELECT_OPTIONS, store.model.props.filter)
    console.log(getValue(SELECT_OPTIONS, store.model.props.filter))
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
          value={getValue(SELECT_OPTIONS, store.model.props.filter)}
          options={SELECT_OPTIONS}
          autoFocus={false}
          isClearable
          getOptionValue={opt => opt.value}
          getLabelValue={opt => opt.label}
          hideSelectedOptions
          isMulti={store.model.isMultiFiltering()}
          onChange={this.changeFilter}
          placeholder="All Responses"
        />
      </div>
    )
  }
}

export default PropertyFilter
