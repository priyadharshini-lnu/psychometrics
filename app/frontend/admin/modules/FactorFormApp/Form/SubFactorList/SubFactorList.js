import React from 'react'
import {
  Card, Button, Empty, Table, InputNumber,
} from 'antd'
import { setIn } from 'utils/immutable'
import styles from './styles.scss'
import Title from './Title'

const getColumns = (onChange, onRemove, errors) => [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text, record) => {
      const error = errors.find(([id]) => id === record.sub_factor_id)
      return (
        <>
          <div>{record.name}</div>
          {error && (
            <div className="has-error">
              <span className="ant-form-explain">{error[1]}</span>
            </div>
          )}
        </>
      )
    },
  },
  {
    title: 'Weight',
    dataIndex: 'weight',
    render: (text, record, index) => (
      <InputNumber
        value={record.weight}
        size="small"
        min={0}
        max={10}
        step={0.1}
        onChange={weight => onChange({ ...record, weight }, index)}
      />
    ),
  },
  {
    title: 'Actions',
    dataIndex: 'operation',
    render: (text, record) => <Button type="link" icon="delete" size="small" onClick={() => onRemove(record)} />,
  },
]

const FACTORS_SUB_FACTORS = 'factors_sub_factors'

export default function SubFactorList ({
  factor, factors, onChange, errors,
}) {
  const onUpdate = (subFactor, index) => {
    const value = setIn(factor[FACTORS_SUB_FACTORS], [index], subFactor)
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const onRemove = ({ sub_factor_id: subFactorId }) => {
    const value = factor[FACTORS_SUB_FACTORS].filter(f => f.sub_factor_id !== subFactorId)
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const onAdd = (subFactor) => {
    const value = [subFactor, ...factor[FACTORS_SUB_FACTORS]]
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }


  return (
    <Card className={styles.container} title={<Title factors={factors} factor={factor} onAdd={onAdd} />}>
      {factor[FACTORS_SUB_FACTORS].length ? (
        <Table
          columns={getColumns(onUpdate, onRemove, (errors && errors.factorsSubFactorsAttributes) || [])}
          dataSource={factor[FACTORS_SUB_FACTORS]}
          size="small"
          rowKey="sub_factor_id"
          pagination={false}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  )
}
