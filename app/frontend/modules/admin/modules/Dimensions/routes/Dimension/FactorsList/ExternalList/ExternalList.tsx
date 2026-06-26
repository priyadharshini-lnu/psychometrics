import {
  Card, Select, Input, Button, Empty,
  Col, Row, Form,
} from 'antd'
import { DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from '../SubFactorList/styles.less'

const { I18n } = window
const EXTERNAL_SCORING = 'externalScoring'

const TYPES = [
  'score',
  'norm_score',
  'zscore',
  'percentage',
  'percentile',
]


export default function ExternalList ({
  form,
}) {
  const externalFactors = Form.useWatch(EXTERNAL_SCORING, { form, preserve: true }) || []

  const onChange = (value) => {
    form.setFieldsValue({ [EXTERNAL_SCORING]: value })
  }

  const onUpdate = (index, args) => {
    const value = externalFactors.map((row, i) => (i === index ? { ...row, ...args } : row))
    onChange(value)
  }

  const onRemove = (index) => {
    const value = externalFactors.filter((row, i) => i !== index)
    onChange(value)
  }

  const onAdd = () => {
    const value = [{ type: TYPES[0], jsonpath: '' }, ...externalFactors]
    onChange(value)
  }

  const rows = externalFactors

  return (
    <Form.Item name={EXTERNAL_SCORING}>
      <Card
        className={styles.container}
        title={(
          <Row>
            <Col span={22}>
              <span>{I18n.t('admin.factors_form_components_ExternalList_title')}</span>
            </Col>
            <Col span={2}>
              <Button onClick={onAdd}>{I18n.t('shared.add')}</Button>
            </Col>
          </Row>
        )}
      >
        {rows.length ? (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th key="type">{I18n.t('shared.type')}</th>
                <th key="jsonpath">{I18n.t('admin.factors_form_components_ExternalList_table_jsonpath')}</th>
                <th key="actions">{I18n.t('shared.actions')}</th>
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
    </Form.Item>
  )
}
