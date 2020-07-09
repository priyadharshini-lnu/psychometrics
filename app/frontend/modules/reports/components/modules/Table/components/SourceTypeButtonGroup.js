import React from 'react'
import cs from 'classnames'

export default function SourceTypeButtonGroup ({ model, onChange }) {
  return (
    <div className={cs('btn-group')}>
      <button
        onClick={() => onChange('sourceType', 'Factor')}
        type="button"
        className={cs('btn', 'btn-default', { active: model.props.sourceType === 'Factor' })}
      >
        Factors
      </button>
      <button
        onClick={() => onChange('sourceType', 'Question')}
        type="button"
        className={cs('btn', 'btn-default', { active: model.props.sourceType === 'Question' })}
      >
        Questions
      </button>
    </div>
  )
}
