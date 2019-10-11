import React from 'react'
import _ from 'lodash'
import Criteria from './Criteria'
import styles from './styles.scss'

export default function CriteriaList ({
  criteria, datasheetFields, addCriteria, removeCriteria, updateCriteria,
}) {
  if (_.isEmpty(datasheetFields)) {
    return <div className={styles.datasheetNotAvailableMethod}>Datasheet not available for this project</div>
  }

  if (_.isEmpty(criteria)) {
    return (
      <div className={styles.addLink} onClick={addCriteria} role="button" tabIndex={0}>
        Click here to add criteria
      </div>
    )
  }
  return criteria.map((condition, index) => (
    <div className="mbs" key={index}>
      <Criteria
        datasheetFields={datasheetFields}
        condition={condition}
        updateCriteria={(field, value) => updateCriteria(index, field, value)}
        addCriteria={addCriteria}
        removeCriteria={() => removeCriteria(index)}
      />
    </div>
  ))
}
