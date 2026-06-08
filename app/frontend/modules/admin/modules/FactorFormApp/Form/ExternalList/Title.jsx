import { Col, Row, Button } from 'antd'

export default function Title ({ onAdd }) {
  return (
    <Row>
      <Col span={22}>
        <span>{I18n.t('admin.factors_form_components_ExternalList_title')}</span>
      </Col>
      <Col span={2}>
        <Button onClick={onAdd}>{I18n.t('admin.factors_form_components_ExternalList_add')}</Button>
      </Col>
    </Row>
  )
}
