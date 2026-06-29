import { useState, useEffect } from 'react'
import {
  Row, Col, Steps, Form, App,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import dayjs from '~/utils/dayjs'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'
import { BasicInfoForm } from './BasicInfo'
import { Facilitators } from './Facilitators'
import { AddSubjects } from '../../Invites/Form/AddSubjects'
import { BaseInfoForm, Errors } from '../../Invites/Form/BaseInfo'
import { SendInvitation } from '../../Invites/Form/SendInvitations'
import { SuccessPage } from '../../Invites/Form/SuccessPage'
import { SuccessCreatedPage } from './SuccessCreatedStep'
import { getData } from '~/modules/admin/core/ui/temp'
import { normalizeTimeZone } from '~/hooks/useTimezones'

const { I18n } = window

interface BasicInfoData {
  dates: dayjs.Dayjs[],
  time: dayjs.Dayjs,
  duration: number,
  timezone: string,
  video_call_type: number,
  meeting_link: string,
  cancellation_lead_time: number,
  scheduling_lead_time: number,
  allow_late_cancellation_and_rescheduling: boolean,
  disable_cancellation_and_rescheduling: boolean,
  campaignAssessmentGroupId: number,
  workshop_resources: {
    key: number,
    name: string,
    url: string,
  }[]
}

const VIDEO_CALL_TYPES = {
  not_available: 0, internal: 1, custom: 2,
}

export const AssessmentCenterFormComponent = ({ workshop }) => {
  const {
    campaignId,
  } = useParams() as { campaignId: string }
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling`
  const [basicInfoData, setBasicInfoData] = useState<BasicInfoData>({
    dates: [],
    time: dayjs(),
    duration: workshop?.duration || 0,
    timezone: workshop?.timezone || normalizeTimeZone(dayjs.tz.guess()),
    video_call_type: VIDEO_CALL_TYPES[workshop?.videoCallType] || 0,
    meeting_link: workshop?.meetingLink || '',
    workshop_resources: workshop?.workshopResources || [{ key: 1, name: '', url: '' }],
    cancellation_lead_time: workshop?.cancellationLeadTime,
    scheduling_lead_time: workshop?.schedulingLeadTime,
    allow_late_cancellation_and_rescheduling: workshop?.allowLateCancellationAndRescheduling,
    disable_cancellation_and_rescheduling: workshop?.disableCancellationAndRescheduling,
    campaignAssessmentGroupId: workshop?.campaignAssessmentGroupId,
  })
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [showSuccessPage, setShowSuccessPage] = useState(false)
  const [submitPage, showSubmitPage] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [form] = Form.useForm()
  const { modal } = App.useApp()

  useEffect(() => {
    form.setFieldsValue({
      allowLanguagePreference: false,
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

  const { createResource, isLoading } = useResources<WorkshopInvite>('workshop_invites',
    { basePath: `campaigns/${campaignId}` })
  const workshopInviteCreationInProgress = isLoading('add')
  const [errors, setErrors] = useState<Errors | null>(null)

  const submitForm = () => {
    createResource({
      name: form.getFieldValue('name'),
      title: form.getFieldValue('title'),
      allowLanguagePreference: form.getFieldValue('allowLanguagePreference'),
      allowedLanguages: form.getFieldValue('languagesAllowed'),
      allowNeurodiversityOption: form.getFieldValue('allowNeurodiversityOption'),
      workshopIds: (form.getFieldValue('workshopIds') || []).map(workshop => workshop.id),
      subjects: (form.getFieldValue('subjects') || []).map(user => ({ userId: user.id })),
      translations: form.getFieldValue('translations') || [],
      campaignAssessmentGroupId: form.getFieldValue('campaignAssessmentGroupId'),
    }).then(() => {
      showSubmitPage(true)
    }).catch((errors) => {
      setErrors(errors)
    })
  }

  const handleCancel = () => {
    modal.confirm({
      title: I18n.t('admin.cancel_confirmation_title'),
      content: I18n.t('admin.cancel_confirmation_message'),
      okText: I18n.t('shared.confirm'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => routeUtils.moveTo(navigate, prefixPath, '/assessment_center'),
    })
  }

  return (
    <div className={styles.mainForm}>
      <Row className={styles.steps}>
        <Col span={24}>
          <Steps
            size="small"
            current={step}
            items={[
              {
                title: I18n.t('admin.steps_basic_information'),
              },
              {
                title: I18n.t('admin.steps_facilitators'),
              },
              {
                title: I18n.t('admin.steps_invite_subjects'),
              },
              {
                title: I18n.t('admin.steps_invite_options'),
              },
              {
                title: I18n.t('admin.steps_send_invitations'),
              },
            ]}
          />
        </Col>
      </Row>
      {step === 0 && <BasicInfoForm initialValues={basicInfoData} onCancel={handleCancel} onNext={handleNextForm1} />}
      {step === 1 && (showSuccessPage
        ? (
          <SuccessCreatedPage next={() => {
            setShowSuccessPage(false)
            handleNext()
          }}
          />
        )
        : (
          <Facilitators
            basicInfoData={basicInfoData}
            onSubmit={showSuccess}
            onCancel={handleCancel}
            onPrevious={handlePrevious}
          />
        ))}
      {step === 2 && <AddSubjects form={form} onCancel={handleCancel} next={handleNext} />}
      {step === 3 && (
        <BaseInfoForm
          form={form}
          onCancel={handleCancel}
          next={handleNext}
          prev={handlePrevious}
          workshops={workshops}
          errors={errors}
        />
      )}
      {step === 4 && (submitPage
        ? <SuccessPage />
        : (
          <SendInvitation
            form={form}
            onCancel={handleCancel}
            submit={submitForm}
            prev={handlePrevious}
            errors={errors}
            isLoading={workshopInviteCreationInProgress}
          />
        ))}
    </div>
  )
}

export const AssessmentCenterForm = connect((state: RootState) => ({
  workshop: getData(state),
}), {})(AssessmentCenterFormComponent)
