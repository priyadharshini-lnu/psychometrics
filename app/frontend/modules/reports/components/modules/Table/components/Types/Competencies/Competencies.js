import React from 'react'
import Types from './Types'
import Legend from './Legend'
import lookupAndEnhanceFilters from './lookupAndEnhanceFilters'

export default function Competencies ({ model }) {
  const Type = Types[model.props.sourceType]

  const filters = lookupAndEnhanceFilters({ colors: model.props.colors, filterIds: model.props.filter })
  return (
    <div>
      <Type model={model} filters={filters} />
      <Legend filters={filters} model={model} />
    </div>
  )
}
