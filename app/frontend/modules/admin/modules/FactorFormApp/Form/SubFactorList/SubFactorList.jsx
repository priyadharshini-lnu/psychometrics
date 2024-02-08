import _ from 'lodash'
import {
  Card, Empty,
} from 'antd'
import { DnDProvider } from '~/components/DnD'
import styles from './styles.less'
import Title from './Title'
import SubFactorRow from './SubFactorRow'
import GetColumnsByStrategy, { PREDICATES } from './GetColumnsByStrategy'

const FACTORS_SUB_FACTORS = 'factors_sub_factors'

const defaultPredicate = PREDICATES[0]

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
    const value = [
      { ...subFactor, predicate: defaultPredicate, position: factor[FACTORS_SUB_FACTORS].length + 1 },
      ...factor[FACTORS_SUB_FACTORS]]
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value } })
  }

  const moveRow = (list) => {
    onChange({ currentTarget: { name: FACTORS_SUB_FACTORS, value: list } })
  }

  const tableErrors = (errors && errors.factorsSubFactorsAttributes) || []

  const dataSource = _.sortBy(factor[FACTORS_SUB_FACTORS], ['position'])
  const columns = GetColumnsByStrategy.run(factor, onUpdate, onRemove, tableErrors)
  return (
    <Card className={`${styles.container} mbl`} title={<Title factors={factors} factor={factor} onAdd={onAdd} />}>
      {factor[FACTORS_SUB_FACTORS].length ? (
        <DnDProvider>
          <table className="table table-bordered">
            <thead>
              <tr>
                {columns.map(d => <th key={d.dataIndex}>{d.title}</th>)}
              </tr>
            </thead>
            <tbody>
              {dataSource.map(s => (
                <SubFactorRow
                  key={s.sub_factor_id}
                  subFactor={s}
                  moveRow={moveRow}
                  scoringStrategy={factor.scoring_strategy}
                  columns={columns}
                  list={dataSource}
                />
              ))}
            </tbody>
          </table>
        </DnDProvider>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  )
}
