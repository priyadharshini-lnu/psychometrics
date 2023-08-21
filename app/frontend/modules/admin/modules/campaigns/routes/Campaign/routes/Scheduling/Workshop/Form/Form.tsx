import { useState } from 'react'
import {
  Row, Col, Steps,
} from 'antd'
import moment from 'moment'
import styles from './Form.less'
import { BasicInfoForm } from './BasicInfo'
import { Facilitators } from './Facilitators'

interface BasicInfoData {
  dates: moment.Moment[],
  time: moment.Moment,
  duration: number,
  timezone: string,
  video_call_type: number,
  meeting_link: string,
  workshop_resources: {
    key: number,
    name: string,
    url: string,
  }[]
}

export const AssessmentCenterForm = () => {
  const [basicInfoData, setBasicInfoData] = useState<BasicInfoData>({
    dates: [],
    time: moment(),
    duration: 0,
    timezone: '',
    video_call_type: 0,
    meeting_link: '',
    workshop_resources: [{ key: 1, name: '', url: '' }],
  })

  const [step, setStep] = useState(0)

  const handleNextForm1 = (values: BasicInfoData) => {
    setBasicInfoData({ ...basicInfoData, ...values })
    setStep(step + 1)
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  return (
    <div className={styles.mainForm}>
      <Row className={styles.steps}>
        <Col span={12}>
          <Steps
            current={step}
            items={[
              {
                title: 'Basic Information',
              },
              {
                title: 'Facilitators',
              },
            ]}
          />
        </Col>
      </Row>
      {step === 0 && <BasicInfoForm initialValues={basicInfoData} onNext={handleNextForm1} />}
      {step === 1 && <Facilitators basicInfoData={basicInfoData} onPrevious={handlePrevious} />}
    </div>
  )
}
