import React from 'react'
import {
  Card, Button, Empty, Table, InputNumber,
} from 'antd'
import { setIn } from 'utils/immutable'
import styles from './styles.scss'
import Title from './Title'

const getColumns = (onChange, onRemove) => [
  {
    title: 'Name',
    dataIndex: 'name',
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

export default function SubFactorList ({ factor, factors, onChange }) {
  const onUpdate = (subFactor, index) => {
    const value = setIn(factor[FACTORS_SUB_FACTORS], [index], subFactor)
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const onRemove = ({ sub_factor_id: subFactorId }) => {
    const value = factor[FACTORS_SUB_FACTORS].filter(f => f.sub_factor_id !== subFactorId)
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const onAdd = (subFactor) => {
    const value = [...factor[FACTORS_SUB_FACTORS], subFactor]
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }


  return (
    <Card className={styles.container} title={<Title factors={factors} factor={factor} onAdd={onAdd} />}>
      {factor[FACTORS_SUB_FACTORS].length ? (
        <Table
          columns={getColumns(onUpdate, onRemove)}
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
