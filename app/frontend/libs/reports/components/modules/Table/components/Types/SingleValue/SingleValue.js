import React from 'react'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import Types from './Types'

const SingleValue = ({ model }) => {
  const Type = Types[model.props.sourceType]
  const filters = model.props.filter.map(
    filterId => _.find(AppStore.report.filters, { id: filterId }),
  ).filter(f => !_.isEmpty(f))
  return (
    <div>
      <Type model={model} filters={filters} />
    </div>
  )
}
export default SingleValue
