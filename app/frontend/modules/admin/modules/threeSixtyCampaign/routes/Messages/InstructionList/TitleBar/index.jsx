import {
  Switch, Row, Col,
} from 'antd'
import styles from './styles.less'

export default function TitleBar ({ instructionTemplate, toggleEnabled }) {
  return (
    <div className={styles.container}>
      <Row className={styles.titleContainer}>
        <Col md={14} lg={16} xl={18}>
          <div className={styles.title}>
            {I18n.t(`admin.${instructionTemplate.name}_name`)}
          </div>
          <div>
            {I18n.t(`admin.${instructionTemplate.name}_description`)}
          </div>
        </Col>
        <Col md={10} lg={8} xl={6}>
          <Switch
            className={styles.switch}
            checked={instructionTemplate.enabled}
            onChange={toggleEnabled}
            aria-label={I18n.t('admin.threesixty_campaigns_instruction_visible_to_participants')}
          />
        </Col>
      </Row>
    </div>
  )
}
