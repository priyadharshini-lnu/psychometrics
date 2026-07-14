import { useEffect, useState, useCallback } from 'react'
import _ from 'lodash'
import {
  Col, Row, Select, Spin,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Factor, FactorSearchTR } from '~/modules/admin/modules/campaigns/core/factors'

export default function Title ({ factor, onAdd }) {
  const { dimensionId } = useParams() as { dimensionId: string }
  const [selectValue, setSelectValue] = useState<string | null>(null)
  const [state, setState] = useState({
    data: [] as Factor[], requests: {}, meta: {}, query: {},
  })
  const { data: factors, fetch: search, isLoading } = useResources<Factor>('factors', {
    basePath: `dimensions/${dimensionId}/`,
    responseType: FactorSearchTR,
    stateManager: {
      state, setState,
    },
  })

  const searchFactor = useCallback(_.debounce((value) => {
    search({
      apiConfig: {
        filter: { search_query: value },
      },
    })
  }, 300), [])

  useEffect(() => {
    search()
  }, [])

  const availableFactors = _.filter(factors, f => f.id !== factor.id)

  const add = (factorId) => {
    const subFactor = factors.find(f => f.id === factorId)
    if (!subFactor) return
    onAdd({
      subFactorId: subFactor.id, name: subFactor.name, weight: 1.0,
    })
    setSelectValue(null)
  }

  return (
    <Row>
      <Col span={8}>
        <span>Sub Factors</span>
      </Col>
      <Col span={7} offset={5}>
        <Select
          dropdownStyle={{ zIndex: 9900 }}
          style={{ width: 224 }}
          className="mls"
          placeholder="Choose a sub factor"
          showSearch
          value={selectValue}
          onSearch={searchFactor}
          onChange={add}
          notFoundContent={isLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          {availableFactors.map(({ id, name }) => (
            <Select.Option
              key={id}
              disabled={_.some(factor.subFactors, f => f.subFactorId === id)}
              value={id}
            >
              {name}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  )
}
