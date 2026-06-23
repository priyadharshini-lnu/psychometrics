import {
  Card, Select, Input, Button, Empty,
} from 'antd'
import { DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from '../SubFactorList/styles.less'
import Title from './Title'

const EXTERNAL_SCORING = 'external_scoring'

const TYPES = [
  'score',
  'norm_score',
  'zscore',
  'percentage',
  'percentile',
]
export default function ExternalList ({
  factor, factors, onChange,
}) {
  const onUpdate = (index, args) => {
    const value = factor[EXTERNAL_SCORING].map((row, i) => (i === index ? { ...row, ...args } : row))
    onChange({ currentTarget: { name: EXTERNAL_SCORING, value } })
  }

  const onRemove = (index) => {
    const value = factor[EXTERNAL_SCORING].filter((row, i) => i !== index)
    onChange({ currentTarget: { name: EXTERNAL_SCORING, value } })
  }

  const onAdd = () => {
    const value = [{ type: TYPES[0], jsonpath: '' }, ...factor[EXTERNAL_SCORING]]
    onChange({ currentTarget: { name: EXTERNAL_SCORING, value } })
  }

  const rows = factor[EXTERNAL_SCORING]

  return (
    <Card className={styles.container} title={<Title factors={factors} factor={factor} onAdd={onAdd} />}>
      {rows.length ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th key="type">{I18n.t('admin.factors_form_components_ExternalList_table_type')}</th>
              <th key="jsonpath">{I18n.t('admin.factors_form_components_ExternalList_table_jsonpath')}</th>
              <th key="actions">{I18n.t('admin.factors_form_components_ExternalList_table_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className={styles.td} style={{ width: 150 }}>
                  <Select
                    style={{ width: '100%' }}
                    value={row.type}
                    onChange={type => onUpdate(i, { type })}
                    getPopupContainer={node => node.parentNode}
                  >
                    {TYPES.map(type => (
                      <Select.Option key={type} value={type}>
                        {I18n.t(`admin.factors_form_components_ExternalList_table_types_${type}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </td>
                <td className={styles.td}>
                  <Input.TextArea
                    rows={2}
                    value={row.jsonpath}
                    onChange={e => onUpdate(i, { jsonpath: e.target.value })}
                  />
                </td>
                <td className={styles.td} style={{ width: 50 }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => onRemove(i)}
                  >
                    <DeleteOutlined />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    </Card>
  )
}
