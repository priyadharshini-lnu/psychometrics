import _ from 'lodash'
import {
  Card, Empty, Form, FormInstance,
} from 'antd'
import { DnDProvider } from '~/components/DnD'
import styles from './styles.less'
import Title from './Title'
import SubFactorRow from './SubFactorRow'
import GetColumnsByStrategy, { PREDICATES } from './GetColumnsByStrategy'

const FACTORS_SUB_FACTORS = 'subFactors'
const CLIENT_ROW_KEY = '__clientRowKey'

const defaultPredicate = PREDICATES[0]

export default function SubFactorList ({ form }: { form: FormInstance }) {
  const subFactors = Form.useWatch(FACTORS_SUB_FACTORS, { form }) || []
  const strategy = Form.useWatch('scoringStrategy', form)
  const factorId = form.getFieldValue('id')

  const getSubFactorIdentity = subFactor => (
    subFactor?.id
    || subFactor?.[CLIENT_ROW_KEY]
    || subFactor?.subFactorId
    || subFactor?.sub_factor_id
    || subFactor?.factorsSubFactorId
  )

  const isSameSubFactor = (left, right) => (
    getSubFactorIdentity(left) !== undefined
    && getSubFactorIdentity(left) === getSubFactorIdentity(right)
  )

  const onChange = (value) => {
    form.setFieldsValue({ [FACTORS_SUB_FACTORS]: value })
  }

  const onUpdate = (subFactor) => {
    const value = subFactors.map(s => (isSameSubFactor(s, subFactor) ? { ...s, ...subFactor } : s))
    onChange(value)
  }

  const onRemove = (subFactor) => {
    const value = subFactors.filter(f => !isSameSubFactor(f, subFactor))
    onChange(value)
  }

  const onAdd = (subFactor) => {
    const clientRowKey = _.uniqueId('subfactor_')
    const value = [
      {
        ...subFactor,
        [CLIENT_ROW_KEY]: clientRowKey,
        sub_factor_id: subFactor?.subFactorId,
        predicate: defaultPredicate,
        position: subFactors.length + 1,
      },
      ...subFactors]
    onChange(value)
  }

  const moveRow = (list) => {
    onChange(list)
  }

  // const tableErrors = (errors && errors.factorsSubFactorsAttributes) || []

  const dataSource = _.sortBy(subFactors, ['position']).map(subFactor => ({
    ...subFactor,
    sub_factor_id: subFactor.sub_factor_id
      || subFactor.subFactorId
      || subFactor.id
      || subFactor[CLIENT_ROW_KEY],
  }))
  const columns = GetColumnsByStrategy.run(strategy, onUpdate, onRemove)

  return (
    <Form.Item>
      <Card
        className={`${styles.container} mbl`}
        title={<Title factor={{ id: factorId, subFactors }} onAdd={onAdd} />}
      >
        {subFactors.length ? (
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
                    key={getSubFactorIdentity(s)}
                    subFactor={s}
                    moveRow={moveRow}
                    scoringStrategy={strategy}
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
    </Form.Item>
  )
}
