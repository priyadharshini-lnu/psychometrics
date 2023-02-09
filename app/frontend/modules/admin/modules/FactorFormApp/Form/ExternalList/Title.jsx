import { Col, Row, Button } from 'antd'

export default function Title ({ onAdd }) {
  return (
    <Row>
      <Col span={22}>
        <span>{I18n.t('administration.factors.form.components.ExternalList.title')}</span>
      </Col>
      <Col span={2}>
        <Button onClick={onAdd}>{I18n.t('administration.factors.form.components.ExternalList.add')}</Button>
      </Col>
    </Row>
  )
}
