import React, { useState } from 'react'
import _ from 'lodash'
import {
  Button, Col, Row, Select,
} from 'antd'

export default function Title ({ factors, factor, onAdd }) {
  const availableFactors = _.filter(factors, f => f.key !== factor.id)
  const [selectedFactor, setSelectedFactor] = useState()

  const add = () => {
    const subFactor = factors.find(f => f.key === selectedFactor)
    onAdd({ sub_factor_id: selectedFactor, name: subFactor.value, weight: 1 })
    setSelectedFactor(null)
  }
  return (
    <Row>
      <Col span={8}>
        <span>Sub Factors</span>
      </Col>
      <Col span={8} offset={4}>
        <Select
          style={{ width: 205 }}
          className="mls"
          placeholder="Choose a sub factor"
          value={selectedFactor || ''}
          onChange={val => setSelectedFactor(val)}
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
        <Button shape="circle" icon="plus" className="mls" onClick={add} disabled={!selectedFactor} />
      </Col>
    </Row>
  )
}
