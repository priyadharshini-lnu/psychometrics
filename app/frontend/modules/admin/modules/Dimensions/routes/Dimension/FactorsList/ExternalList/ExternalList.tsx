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


export default function ExternalList () {
  return (
    <Form.List name={EXTERNAL_SCORING}>
      {(fields, { add, remove }) => (
        <Card
          className={styles.container}
          title={(
            <Row>
              <Col span={22}>
                <span>{I18n.t('admin.factors_form_components_ExternalList_title')}</span>
              </Col>
              <Col span={2}>
                <Button onClick={() => add({ type: TYPES[0], jsonpath: '' })}>
                  {I18n.t('shared.add')}
                </Button>
              </Col>
            </Row>
          )}
        >
          {fields.length ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th key="type">{I18n.t('shared.type')}</th>
                  <th key="jsonpath">{I18n.t('admin.factors_form_components_ExternalList_table_jsonpath')}</th>
                  <th key="actions">{I18n.t('shared.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(field => (
                  <tr key={field.key}>
                    <td className={styles.td} style={{ width: 150 }}>
                      <Form.Item name={[field.name, 'type']} noStyle>
                        <Select
                          style={{ width: '100%' }}
                          getPopupContainer={node => node.parentNode}
                        >
                          {TYPES.map(type => (
                            <Select.Option key={type} value={type}>
                              {I18n.t(`admin.factors_form_components_ExternalList_table_types_${type}`)}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </td>
                    <td className={styles.td}>
                      <Form.Item name={[field.name, 'jsonpath']} noStyle>
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </td>
                    <td className={styles.td} style={{ width: 50 }}>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => remove(field.name)}
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
      )}
    </Form.List>
  )
}
