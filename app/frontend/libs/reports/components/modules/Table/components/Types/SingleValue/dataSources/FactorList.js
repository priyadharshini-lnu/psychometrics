import React from 'react'
import Select from 'react-select'
import AppStore from 'rb/store/AppStore'
import store from 'rb/store/PropertyPanelStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

export default function FactorList ({ model, onChange }) {
  const assessment = AppStore.getAssessmentById(model.assessment_id)
  return (
    <div className="mtm">
      Factor
      <Select
        value={getValue(AppStore.factors[assessment.dimensionId] || [], store.model.props.factorIds)}
        options={AppStore.factors[assessment.dimensionId] || []}
        getOptionValue={opt => opt.id}
        getOptionLabel={opt => opt.name}
        autoFocus={false}
        isClearable={false}
        isMulti
        onChange={factors => onChange('factorIds', factors.map(f => f.id))}
        placeholder="All Responses"
      />
    </div>
  )
}
