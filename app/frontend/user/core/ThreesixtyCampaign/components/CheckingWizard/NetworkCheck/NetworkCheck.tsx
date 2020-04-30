import React from 'react'
import { Card, Col, Button } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import cardStyles from '../CardStyles.scss'
import styles from './styles.scss'

interface Props {
  nextStep: () => void
}
const { I18n } = window

const NetworkCheck: React.FC<Props> = ({ nextStep }) => (
  <Col className={cardStyles.container} lg={{ span: 8, offset: 8 }} xs={24} sm={{ span: 16, offset: 4 }}>
    <Card className={cardStyles.card}>
      <span className={styles.icon} />
      <div className={cardStyles.title}>{I18n.t('checking_wizard.network_check.title')}</div>
      <div>
        <Button type="primary" className={cardStyles.button} onClick={nextStep}>
          {I18n.t('checking_wizard.network_check.continue')}
          <RightOutlined />
        </Button>
      </div>
    </Card>
  </Col>
)

export default NetworkCheck
