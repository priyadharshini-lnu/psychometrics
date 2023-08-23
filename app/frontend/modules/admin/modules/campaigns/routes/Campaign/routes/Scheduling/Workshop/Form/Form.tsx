import { useState, useEffect } from 'react'
import {
  Row, Col, Steps, Form, Button,
} from 'antd'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'
import { DirectionalNavigateBackIcon } from '~/glint'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'
import { BasicInfoForm } from './BasicInfo'
import { Facilitators } from './Facilitators'
import { AddSubjects } from '../../Invites/Form/AddSubjects'
import { BaseInfoForm } from '../../Invites/Form/BaseInfo'
import { SendInvitation } from '../../Invites/Form/SendInvitations'
import { SuccessPage } from '../../Invites/Form/SuccessPage'
import { SuccessCreatedPage } from './SuccessCreatedStep'

const { I18n } = window

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
    timezone: moment.tz.guess(),
    video_call_type: 0,
    meeting_link: '',
    workshop_resources: [{ key: 1, name: '', url: '' }],
  })
  const history = useHistory()
  const params = useParams<{campaignId: string}>()
  const [step, setStep] = useState(0)
  const [showSuccessPage, setShowSuccessPage] = useState(false)
  const [submitPage, showSubmitPage] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({
      allowLanguagePreference: true,
      allowedLanguages: [],
      allowNeurodiversityOption: false,
    })
  }, [])

  const handleNextForm1 = (values: BasicInfoData) => {
    setBasicInfoData({ ...basicInfoData, ...values })
    setStep(step + 1)
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleNext = () => {
    setStep(step + 1)
  }

  const showSuccess = (workshops) => {
    setWorkshops(workshops)
    setShowSuccessPage(true)
  }

  const { createResource } = useResources<WorkshopInvite>('workshop_invites')

  const submitForm = () => {
    createResource({
      title: form.getFieldValue('title'),
      allowLanguagePreference: form.getFieldValue('allowLanguagePreference'),
      allowedLanguages: ['en', 'ar'],
      allowNeurodiversityOption: form.getFieldValue('allowNeurodiversityOption'),
      workshopIds: (form.getFieldValue('workshopIds') || []).map(workshop => workshop.id),
      subjects: (form.getFieldValue('subjects') || []).map(user => ({ userId: user.id })),
      translations: form.getFieldValue('translations') || [],
    }, { apiConfig: { filter: { workshops_campaign_id_eq: params.campaignId } } }).then(() => {
      showSubmitPage(true)
    })
  }

  return (
    <div className={styles.mainForm}>
      <Row className={styles.steps}>
        <Button type="link" onClick={() => history.goBack()}><DirectionalNavigateBackIcon /></Button>
        <Col span={24}>
          <Steps
            current={step}
            items={[
              {
                title: I18n.t('administration.assessment_center.steps.basic_information'),
              },
              {
                title: I18n.t('administration.assessment_center.steps.facilitators'),
              },
              {
                title: I18n.t('administration.assessment_center.steps.invite_subjects'),
              },
              {
                title: I18n.t('administration.assessment_center.steps.invite_options'),
              },
              {
                title: I18n.t('administration.assessment_center.steps.send_invitations'),
              },
            ]}
          />
        </Col>
      </Row>
      {step === 0 && <BasicInfoForm initialValues={basicInfoData} onNext={handleNextForm1} />}
      {step === 1 && (showSuccessPage
        ? (
          <SuccessCreatedPage next={() => {
            setShowSuccessPage(false)
            handleNext()
          }}
          />
        )
        : <Facilitators basicInfoData={basicInfoData} onSubmit={showSuccess} onPrevious={handlePrevious} />)}
      {step === 2 && <AddSubjects form={form} next={handleNext} prev={handlePrevious} />}
      {step === 3 && <BaseInfoForm form={form} next={handleNext} prev={handlePrevious} workshops={workshops} />}
      {step === 4 && (submitPage
        ? <SuccessPage />
        : <SendInvitation form={form} submit={submitForm} prev={handlePrevious} />)}
    </div>
  )
}
