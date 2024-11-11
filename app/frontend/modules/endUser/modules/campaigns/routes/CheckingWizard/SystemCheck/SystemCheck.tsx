import React from 'react'
import { Card, Col, Button } from 'antd'
import { RightOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import styles from '../CardStyles.less'

interface Props {
  nextStep: () => void
}
const { I18n } = window

export const SystemCheck: React.FC<Props> = ({ nextStep }) => (
  <>
    <title>{`${I18n.t('checking_wizard.system_check.title')}`}</title>
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
  </>
)
