import React from 'react'
import { Icon } from 'antd'
import _ from 'lodash'
import Criteria from './criteria'

export default function CriteriaList ({
  criterias, addCriteria, removeCriteria, updateCriteria,
}) {
  if (_.isEmpty(criterias)) {
    return (
      <div style={{ color: '#1890ff' }} onClick={addCriteria} role="button" tabIndex={0}>
        Click here to add criterias
      </div>
    )
  }
  return criterias.map((condition, index) => (
    <div style={{ marginBottom: '4px' }} key={index}>
      <Criteria condition={condition} updateCriteria={() => updateCriteria(index)} />
      <span style={{ verticalAlign: 'middele' }}>
        <Icon type="minus-circle" onClick={() => removeCriteria(index)} style={{ fontSize: '18px' }} />
        <Icon type="plus-circle" onClick={addCriteria} style={{ marginLeft: '5px', fontSize: '18px' }} />
      </span>
    </div>
  ))
}
