import React from 'react'
import {
  Button, Card, Col,
} from 'antd'
import { CheckOutlined, RightOutlined } from '@ant-design/icons'
import ColoredButton from 'components/ColoredButton'
import styles from './styles.scss'
import Progress from '../Progress'
import CheckList from '../CheckList'
import { CheckListStatus } from '../interfaces'


const { I18n } = window


interface Props {
  nextStep: () => void
}

const AudioCheck: React.FC<Props> = ({ nextStep }) => (
  <>
    <Col className={styles.container} lg={16} xs={24} sm={24}>
      <Card className={styles.card}>
        <div className={styles.title}>{I18n.t('checking_wizard.audio_check.title')}</div>
        <div className={styles.video}>
          <div className={styles.iconContainer}>
            <span className={styles.icon} />
          </div>
          <div className={styles.allowTitle}>
            {I18n.t('checking_wizard.audio_check.allow_title')}
          </div>
          <ColoredButton type="primary" className={styles.allowButton} color="green">
            <CheckOutlined />
            {I18n.t('checking_wizard.audio_check.allow')}
          </ColoredButton>
        </div>
      </Card>
    </Col>
    <Col className={styles.container} lg={8} xs={24} sm={24}>
      <Card className={styles.card}>
        <Progress percent={30} title={I18n.t('checking_wizard.audio_check.processing')} />
        <CheckList
          className="mt24"
          dataSource={[
            { name: I18n.t('checking_wizard.audio_check.access'), status: CheckListStatus.Done },
            { name: I18n.t('checking_wizard.audio_check.speech_detection'), status: CheckListStatus.Failed },
          ]}
        />
        <Button type="primary" className={styles.continueButton} onClick={nextStep}>
          {I18n.t('checking_wizard.audio_check.finish')}
          <RightOutlined />
        </Button>
      </Card>
    </Col>
  </>
)

export default AudioCheck
