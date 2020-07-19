import React from 'react'
import { Card, Col, Button } from 'antd'
import { Config } from 'modules/user/modules/threesixtyCampaign/core/checkingWizard/interfaces'
import { RightOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import styles from '../CardStyles.scss'

interface Props {
  nextStep: () => void
  config: Config
}
const { I18n } = window

const SystemCheck: React.FC<Props> = ({ nextStep }) => (
  <Col className={styles.container} lg={{ span: 8, offset: 8 }} xs={24} sm={{ span: 16, offset: 4 }}>
    <Card className={styles.card}>
      <SafetyCertificateOutlined className={styles.mainIcon} />
      <div className={styles.title}>{I18n.t('checking_wizard.system_check.title')}</div>
      <div>
        <Button type="primary" className={styles.button} onClick={nextStep}>
          {I18n.t('checking_wizard.system_check.continue')}
          <RightOutlined />
        </Button>
      </div>
    </Card>
  </Col>
)

export default SystemCheck
