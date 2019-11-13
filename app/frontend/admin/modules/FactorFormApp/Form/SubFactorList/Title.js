import React, { useState } from 'react'
import _ from 'lodash'
import {
  Col, Row, Select,
} from 'antd'

export default function Title ({ factors, factor, onAdd }) {
  const availableFactors = _.filter(factors, f => f.key !== factor.id)
  const [selectedFactor, setSelectedFactor] = useState()

  const add = (factor) => {
    const subFactor = factors.find(f => f.key === factor)
    onAdd({ sub_factor_id: factor, name: subFactor.value, weight: 1 })
    setSelectedFactor(null)
  }

  return (
    <Row>
      <Col span={8}>
        <span>Sub Factors</span>
      </Col>
      <Col span={7} offset={5}>
        <Select
          showSearch
          style={{ width: 224 }}
          className="mls"
          placeholder="Choose a sub factor"
          value={selectedFactor || ''}
          onChange={val => add(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {availableFactors.map(({ key, value }) => (
            <Select.Option
              key={key}
              disabled={_.some(factor.factors_sub_factors, f => f.sub_factor_id === key)}
              value={key}
            >
              {value}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  )
}
