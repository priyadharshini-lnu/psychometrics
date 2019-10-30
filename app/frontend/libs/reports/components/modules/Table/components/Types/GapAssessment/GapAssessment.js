import React from 'react'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import Types from './Types'

const GapAssessment = ({ model }) => {
  const Type = Types[model.props.sourceType]
  const filters = _.take(model.props.filter, 2)
  const left = _.find(AppStore.report.filters, { id: filters[0] })
  const right = _.find(AppStore.report.filters, { id: filters[1] })
  if (!left || !right) return null

  return (
    <div>
      <Type model={model} filters={[left, right]} />
    </div>
  )
}

export default GapAssessment
