import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  PageHeader, Row, Steps, Result, Button, Layout, Col,
} from 'antd'
import qs from 'qs'
import cs from 'classnames'
import { RouteComponentProps } from 'react-router-dom'
import { useMedia } from 'modules/user/rootHooks'
import routeUtils from 'utils/route'
import { Checks, Config } from 'modules/user/modules/campaigns/core/checkingWizard/interfaces'
import Cookies from 'js-cookie'
import styles from './styles.scss'
import SystemCheck from './SystemCheck'
import NetworkCheck from './NetworkCheck'
import VideoCheck from './VideoCheck'
import AudioCheck from './AudioCheck'
import { PropsFromRedux } from './connect'

const { Step } = Steps
const { I18n } = window

const { Content } = Layout

const STEPS = [
  {
    key: 'system',
    component: SystemCheck,
    title: 'checking_wizard.steps.system_check',
    when: () => true,
  },
  {
    key: 'video',
    component: VideoCheck,
    title: 'checking_wizard.steps.video_check',
    when: ({ video }) => video,
  },
  {
    key: 'audio',
    component: AudioCheck,
    title: 'checking_wizard.steps.audio_check',
    when: ({ audio }) => audio,
  },
  {
    key: 'network',
    component: NetworkCheck,
    title: 'checking_wizard.steps.network_check',
    when: ({ network }) => network,
  },
]

interface Params {
  assessmentId: string
  id: string
}

interface OwnProps {
  checks: Checks
  config: Config
  url?: string
  history?: object
  campaignId?: number
  id?: number
}

type Props = OwnProps & PropsFromRedux & RouteComponentProps<Params>

const CheckingWizard: React.FC<Props> = ({
  url, checks, config, fetch, match: { params }, history, campaignId, id,
}) => {
  const parsedAssessmentId = parseInt(params.assessmentId, 10)
  const parsedId = parseInt(params.id, 10)

  useEffect(() => {
    const query = qs.parse(location.search.substr(1))
    fetch(parsedAssessmentId, parsedId, query.type?.toString())
  }, [])

  const [current, setCurrent] = useState(0)
  const [finish, setFinish] = useState(false)

  const isMD = useMedia('md')

  const onFinish = () => {
    if (url) {
      location.href = url
      return
    }

    routeUtils.moveTo(history, '', `/campaigns/${campaignId}/evaluations/${id}`)
  }

  const getSteps = () => STEPS.filter(step => step.when(checks))

  const nextStep = () => {
    const steps = getSteps()
    Cookies.set(`checking_wizard.${steps[current].key}`, true, { expires: 4 / 24 })

    if (current < steps.length - 1) {
      setCurrent(current + 1)
    } else {
      setFinish(true)
    }
  }

  const CurrentCheck = getSteps()[current]?.component

  const getHeaderClassNames = () => {
    const steps = getSteps()
    if (steps.length === 2) return cs('page-header', 'page-header-wrap', 'pb0', styles.header, styles.header50)
    if (steps.length === 3) return cs('page-header', 'page-header-wrap', 'pb0', styles.header, styles.header66)

    return cs('page-header', 'page-header-wrap', 'pb0', styles.header, styles.header100)
  }

  if (_.every(checks, check => check === false)) {
    return null
  }

  return finish ? <Finish onFinish={onFinish} /> : (
    <>
      <PageHeader
        ghost={false}
        className={getHeaderClassNames()}
        backIcon={null}
        title={(
          <div>
            <Steps
              type="navigation"
              current={current}
            >
              {getSteps().map((step, i) => <Step key={i} title={isMD ? I18n.t(step.title) : ''} />)}
            </Steps>
          </div>
        )}
      />
      <Layout>
        <Content className="fluid-container">
          <Row justify="center">
            <Col xs={24} xl={20}>
              <Row gutter={12} className="m16">
                {CurrentCheck && <CurrentCheck nextStep={nextStep} config={config} />}
              </Row>
            </Col>

          </Row>
        </Content>
      </Layout>
    </>
  )
}

export default CheckingWizard


interface FinishProps {
  onFinish: () => void
}

const Finish: React.FC<FinishProps> = ({ onFinish }) => {
  const handleFinish = () => {
    onFinish()
  }

  return (
    <Result
      status="success"
      className={styles.finish}
      title={I18n.t('checking_wizard.success.title')}
      extra={[
        <Button key="primary" type="primary" onClick={handleFinish}>
          {I18n.t('checking_wizard.success.start')}
        </Button>,
      ]}
    />
  )
}
