import React from 'react'
import { Icon } from 'antd'
import _ from 'lodash'
import Criteria from './Criteria'
import css from './styles.scss'

export default function CriteriaList ({
  criteria, datasheetFields, addCriteria, removeCriteria, updateCriteria,
}) {
  if (_.isEmpty(datasheetFields)) {
    return <div className={css.datasheetNotAvailableMethod}>Datasheet not available for this project</div>
  }

  if (_.isEmpty(criteria)) {
    return (
      <div className={css.addCriteriaLink} onClick={addCriteria} role="button" tabIndex={0}>
        Click here to add criteria
      </div>
    )
  }
  return criteria.map((condition, index) => (
    <div className={css.criteriaContainer} key={index}>
      <Criteria
        datasheetFields={datasheetFields}
        condition={condition}
        updateCriteria={(field, value) => updateCriteria(index, field, value)}
      />
      <span>
        <Icon type="minus-circle" onClick={() => removeCriteria(index)} className={css.criteriaAddDeleteIcon} />
        <Icon type="plus-circle" onClick={addCriteria} className={css.addCriteriaIcon} />
      </span>
    </div>
  ))
}
