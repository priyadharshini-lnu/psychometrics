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

const defaultPredicate = PREDICATES[0]

export default function SubFactorList ({ form }: { form: FormInstance }) {
  const subFactors = Form.useWatch(FACTORS_SUB_FACTORS, { form }) || []
  const strategy = Form.useWatch('scoringStrategy', form)
  const factorId = form.getFieldValue('id')

  const onChange = (value) => {
    form.setFieldsValue({ [FACTORS_SUB_FACTORS]: value })
  }
  const onUpdate = (subFactor) => {
    const value = subFactors.map(s => (s.id === subFactor.id ? subFactor : s))
    onChange(value)
  }

  const onRemove = ({ id }) => {
    const value = subFactors.filter(f => f.id !== id)
    onChange(value)
  }

  const onAdd = (subFactor) => {
    const value = [
      { ...subFactor, predicate: defaultPredicate, position: subFactors.length + 1 },
      ...subFactors]
    onChange(value)
  }

  const moveRow = (list) => {
    onChange(list)
  }

  // const tableErrors = (errors && errors.factorsSubFactorsAttributes) || []

  const dataSource = _.sortBy(subFactors, ['position'])
  const columns = GetColumnsByStrategy.run(strategy, onUpdate, onRemove)

  return (
    <Form.Item>
      <Card
        className={`${styles.container} mbl`}
        title={<Title factor={{ id: factorId }} onAdd={onAdd} />}
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
                    key={s.sub_factor_id}
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
