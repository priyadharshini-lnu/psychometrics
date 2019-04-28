import React from 'react'
import { Icon } from "antd";
import Criteria from './criteria'

export default function CriteriaList({ criterias, addCriteria, removeCriteria, updateCriteria }) {
  if (_.isEmpty(criterias)) {
    return <a onClick={addCriteria}>Click here to add criterias</a>
  } else {
    return criterias.map((condition, index) => {
      return (
        <div style={{marginBottom: "4px"}} key={index}>
          <Criteria condition={condition} updateCriteria={updateCriteria.bind(this, index)} />
          <span style={{verticalAlign: 'middele'}}>
            <Icon type="minus-circle" onClick={removeCriteria.bind(this, index)} style={{fontSize: "18px"}} />
            <Icon type="plus-circle" onClick={addCriteria} style={{marginLeft: "5px", fontSize: "18px"}} />
          </span>
        </div>
      )
    })
  }
}