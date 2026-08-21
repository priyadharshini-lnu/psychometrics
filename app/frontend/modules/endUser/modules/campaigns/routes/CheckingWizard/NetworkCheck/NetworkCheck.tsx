import React, { useEffect, useState } from 'react'
import { Card, Col, Button } from 'antd'
import { RightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { Config } from '~/modules/endUser/modules/campaigns/core/checkingWizard/interfaces'
import cardStyles from '../CardStyles.less'
import styles from './NetworkCheck.less'
import { CheckList } from '../CheckList'
import { CheckListStatus } from '../interfaces'
import { Progress } from '../Progress'
import { DocumentTitle } from '~/components/DocumentTitle'

interface Props {
  nextStep: () => void
  config: Config
}

const { I18n } = window

export const NetworkCheck: React.FC<Props> = ({ nextStep, config }) => {
  const [download, setDownload] = useState(null)
  const [upload, setUpload] = useState(null)
  const [status, setStatus] = useState('new')

  const updateMetrics = (metrics) => {
    setDownload(metrics.download)
    setUpload(metrics.upload)
    if (metrics.download < config.network.download || metrics.upload < config.network.upload) {
      setStatus('failed')
    }
  }

  const resetMetrics = () => {
    setDownload(null)
    setUpload(null)
  }

  const View = VIEWS[status]

  return (
    <>
      <DocumentTitle text={I18n.t('checking_wizard.network_check.title')} />
      <Col
        className={cardStyles.container}
        lg={{ span: 8, offset: 8 }}
        xs={24}
        sm={{ span: 16, offset: 4 }}
      >
        <Card className={cardStyles.card}>
          <View
            nextStep={nextStep}
            measures={{ download, upload }}
            resetMetrics={resetMetrics}
            updateMetrics={updateMetrics}
            updateStatus={setStatus}
            config={config}
          />
        </Card>
      </Col>
    </>
  )
}

interface ViewProps {
    updateStatus: (status: string) => void
}
interface Metrics {
  download: number | null
  upload: number | null
}

const NewView: React.FC<ViewProps> = ({ updateStatus }) => (
  <>
    <span className={styles.icon} />
    <div className={cardStyles.title}>{I18n.t('checking_wizard.network_check.title')}</div>
    <div>
      <Button type="primary" className={cardStyles.button} onClick={() => updateStatus('in_progress')}>
        {I18n.t('checking_wizard.network_check.continue')}
        <RightOutlined />
      </Button>
    </div>
  </>
)

const getCheckListStatus = (value: number | null, threshold: number): CheckListStatus => {
  if (value === null) return CheckListStatus.InProgress
  if (value < threshold) return CheckListStatus.Failed

  return CheckListStatus.Done
}

type FailedViewProps = {
  measures: Metrics
  config: Config
} & ViewProps

const FailedView: React.FC<FailedViewProps> = ({ measures, updateStatus, config: { network } }) => (
  <>
    <span className={styles.icon} />
    <div className={cardStyles.title}>{I18n.t('checking_wizard.network_check.please_check_connection')}</div>
    <small>{I18n.t('checking_wizard.network_check.run_again_title')}</small>
    <CheckList
      className="mt16"
      dataSource={[
        {
          name: I18n.t('checking_wizard.network_check.download'),
          status: getCheckListStatus(measures.download, network.download),
        },
        {
          name: I18n.t('checking_wizard.network_check.upload'),
          status: getCheckListStatus(measures.upload, network.upload),
        },
      ]}
    />
    <div>
      <Button type="primary" className={cardStyles.button} onClick={() => updateStatus('in_progress')}>
        {I18n.t('checking_wizard.network_check.run_again')}
        <RightOutlined />
      </Button>
    </div>
  </>
)

interface Progress {
  type: 'upload' | 'download' | 'latency'
  pass: number
  percentDone: number
}
type InProgressViewProps = {
  nextStep: () => void
  resetMetrics: () => void
  // updateMetrics: (data: Metrics) => void
} & Omit<FailedViewProps, 'updateStatus'>

// const PASSES = {
//   download: 7,
//   upload: 4,
// }

const InProgressView: React.FC<InProgressViewProps> = ({
  nextStep, measures, resetMetrics, config: { network },
}) => {
  const [progress] = useState(0)

  useEffect(() => {
    resetMetrics()

    // TODO: Implement the speed test
  }, [])


  return (
    <>
      <Progress percent={progress} title={I18n.t('checking_wizard.network_check.processing')} />
      <CheckList
        className="mt16"
        dataSource={[
          {
            name: I18n.t('checking_wizard.network_check.download'),
            status: getCheckListStatus(measures.download, network.download),
          },
          {
            name: I18n.t('checking_wizard.network_check.upload'),
            status: getCheckListStatus(measures.upload, network.upload),
          },
        ]}
      />
      <div className="mt24">
        <Button
          disabled={measures.upload === null && measures.download === null}
          type="primary"
          className={cardStyles.button}
          onClick={nextStep}
        >
          {I18n.t('checking_wizard.network_check.continue')}
          <RightOutlined />
        </Button>
      </div>
    </>
  )
}


const VIEWS = {
  new: NewView,
  failed: FailedView,
  in_progress: InProgressView,
}
