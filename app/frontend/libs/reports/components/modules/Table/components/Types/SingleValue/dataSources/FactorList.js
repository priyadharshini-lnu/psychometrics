import React from 'react'
import Select from 'react-select'
import AppStore from 'rb/store/AppStore'
import store from 'rb/store/PropertyPanelStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

export default function FactorList ({ model, onChange }) {
  const assessment = AppStore.getAssessmentById(model.assessment_id)
  const options = AppStore.factors[assessment.dimensionId] || []
  return (
    <div className="mtm">
      Factor
      <Select
        value={getValue(options, store.model.props.factorIds.map(id => ({ id })))}
        options={options}
        getOptionValue={opt => opt.id}
        getOptionLabel={opt => (_.find(options, opt) || {}).name}
        autoFocus={false}
        isClearable={false}
        isMulti
        onChange={factors => onChange('factorIds', factors.map(f => f.id))}
        placeholder="All Responses"
      />
    </div>
  )
}
