import React from 'react'
import {
  Card, Empty, Table,
} from 'antd'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styles from './styles.scss'
import Title from './Title'
import SubFactorRow from './SubFactorRow'
import GetColumnsByStrategy from './GetColumnsByStrategy'

const FACTORS_SUB_FACTORS = 'factors_sub_factors'

export default function SubFactorList ({
  factor, factors, onChange, errors,
}) {
  const onUpdate = (subFactor) => {
    const value = factor[FACTORS_SUB_FACTORS].map(s => (s.sub_factor_id === subFactor.sub_factor_id ? subFactor : s))
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const onRemove = ({ sub_factor_id: subFactorId }) => {
    const value = factor[FACTORS_SUB_FACTORS].filter(f => f.sub_factor_id !== subFactorId)
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const onAdd = (subFactor) => {
    const value = [{ ...subFactor, position: factor[FACTORS_SUB_FACTORS].length + 1 }, ...factor[FACTORS_SUB_FACTORS]]
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const moveRow = (dragPosition, hoverPosition) => {
    const value = factor[FACTORS_SUB_FACTORS].map((subFactor) => {
      const { position } = subFactor
      if (position === dragPosition) return { ...subFactor, position: hoverPosition }

      if (dragPosition < hoverPosition && position > dragPosition && position <= hoverPosition) {
        return { ...subFactor, position: position - 1 }
      }

      if (dragPosition > hoverPosition && position >= hoverPosition && position < dragPosition) {
        return { ...subFactor, position: position + 1 }
      }

      return subFactor
    })
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const components = {
    body: {
      row: SubFactorRow,
    },
  }

  const tableErrors = (errors && errors.factorsSubFactorsAttributes) || []

  return (
    <Card className={styles.container} title={<Title factors={factors} factor={factor} onAdd={onAdd} />}>
      {factor[FACTORS_SUB_FACTORS].length ? (
        <DndProvider backend={HTML5Backend}>
          <Table
            columns={GetColumnsByStrategy.run(factor, onUpdate, onRemove, tableErrors)}
            dataSource={_.sortBy(factor[FACTORS_SUB_FACTORS], ['position'])}
            size="small"
            rowKey="sub_factor_id"
            pagination={false}
            components={components}
            onRow={({ position }) => ({
              position,
              moveRow,
              scoringStrategy: factor.scoring_strategy,
            })}
          />
        </DndProvider>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  )
}
