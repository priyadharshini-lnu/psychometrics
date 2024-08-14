import React, { useContext, useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Row, Steps, Result, Button, Layout, Col,
} from 'antd'
import qs from 'qs'
import Cookies from 'js-cookie'
import { connect, ConnectedProps } from 'react-redux'

import { useLocation } from 'react-router-dom'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { fetch } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { Checks, Config } from '~/modules/endUser/modules/campaigns/core/checkingWizard/interfaces'
import LangDropdown from '~/components/LangDropdown'
import { MediaQueryContext, PageHeader as GlintPageHeader } from '~/glint'
import styles from './styles.less'
import { SystemCheck } from './SystemCheck'
import { NetworkCheck } from './NetworkCheck'
import { VideoCheck } from './VideoCheck'
import { AudioCheck } from './AudioCheck'

const connector = connect(({ checkingWizard }: RootState) => ({
  checks: checkingWizard.checks,
  config: checkingWizard.config,
  campaignId: checkingWizard.campaignId,
  id: checkingWizard.id,
  url: checkingWizard.url,
}), {
  fetch,
})

export type PropsFromRedux = ConnectedProps<typeof connector>


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

interface OwnProps {
  assessmentId: number
  userAssessmentId: number
  checks: Checks
  config: Config
  url?: string
}

type Props = OwnProps & PropsFromRedux

const CheckingWizardComponent: React.FC<Props> = ({
  url, checks, config, fetch, assessmentId, userAssessmentId,
}) => {
  const { isMobile } = useContext(MediaQueryContext)
  const { search } = useLocation()
  const mode = new URLSearchParams(search).get('mode')

  useEffect(() => {
    const query = qs.parse(location.search.substr(1))
    fetch(assessmentId, userAssessmentId, query.type?.toString())
  }, [])

  const [currentStep, setCurrentStep] = useState(0)
  const [finish, setFinish] = useState(false)

  const onFinish = () => {
    if (mode === 'edit') { url = `${url}?edit=true` }
    location.href = url
  }

  const getSteps = () => STEPS.filter(step => step.when(checks))

  const nextStep = () => {
    const steps = getSteps()
    if (steps[currentStep].key === 'video') {
      const data = JSON.parse(Cookies.get(`checking_wizard.${steps[currentStep].key}`) || '{}')
      Cookies.set(
        `checking_wizard.${steps[currentStep].key}`,
        JSON.stringify({ ...data, [userAssessmentId]: true }), { expires: 1 / 24 },
      )
    } else {
      Cookies.set(`checking_wizard.${steps[currentStep].key}`, true, { expires: 4 / 24 })
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setFinish(true)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CurrentCheck: any = getSteps()[currentStep]?.component

  if (_.every(checks, check => check === false)) {
    return null
  }

  return (
    <>
      <GlintPageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <LangDropdown />
        </Col>
      </GlintPageHeader>
      {finish ? (
        <Content className={styles.pageLayout}>
          <Row justify="center">
            <Col xs={24} xl={20}>
              <Row justify="center" gutter={12} className="m16">
                <Finish onFinish={onFinish} />
              </Row>
            </Col>

          </Row>
        </Content>
      )
        : (
          <>
            <Steps
              type="navigation"
              current={currentStep}
              direction={isMobile ? 'vertical' : 'horizontal'}
              className={styles.steps}
            >
              {getSteps().map((step, i) => <Step key={i} title={I18n.t(step.title)} />)}
            </Steps>
            <Content className={styles.pageLayout}>
              <Row justify="center">
                <Col xs={24} xl={20}>
                  <Row gutter={12} className="m16">
                    {CurrentCheck && <CurrentCheck nextStep={nextStep} config={config} />}
                  </Row>
                </Col>

              </Row>
            </Content>
          </>
        )}
    </>
  )
}

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

export const CheckingWizard = connector(CheckingWizardComponent)
export default CheckingWizard
