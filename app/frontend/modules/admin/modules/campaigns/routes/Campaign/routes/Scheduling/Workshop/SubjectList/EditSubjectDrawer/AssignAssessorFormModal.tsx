import { FC, useMemo, useState } from 'react'
import {
  Form, Modal, Select, TimePicker, Input, Radio, Alert,
} from 'antd'
import type { FormRule } from 'antd'
import { mergeDateAndTime } from '~/utils/time'
import dayjs from '~/utils/dayjs'
import styles from './EditSubjectDrawer.less'
import {
  AssessorUserAssessment,
  Assessor,
  Workshop,
  CampaignAssessorAssessment,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { ASSESSMENT_SOURCE } from './Constants'

const { I18n } = window

// ToDo: refator this to use proper types
type FormValues = {
  assessmentId: number,
  scheduleTime: dayjs.Dayjs,
  meetingType: string,
  meetingLink: string,
  assessorUserId: string,
}

type OwnProps = {
  onFormFinish: (newAssessment: AssessorUserAssessment,
  type: 'create' | 'update',
  prevAssessment?: AssessorUserAssessment) => void
  assessors?: Assessor[],
  combinedAssessorAssessments?: AssessorUserAssessment[],
  campaignAssessorAssessments: CampaignAssessorAssessment[],
  linkedAssessments: Map<string, AssessorUserAssessment>,
  workshop?: Workshop,
  close: () => void
  assessment?: AssessorUserAssessment,
}

type Props = OwnProps

export const AssignAssessorFormModal:FC<Props> = (props) => {
  const {
    close,
    onFormFinish,
    combinedAssessorAssessments,
    campaignAssessorAssessments,
    linkedAssessments,
    assessors,
    workshop,
    assessment,
  } = props
  const [assessorFormInstance] = Form.useForm()
  const meetingType = Form.useWatch('meetingType', assessorFormInstance)
  const [, setFields] = useState({})
  const [selectedAssessment, setSelectedAssessment] = useState<AssessorUserAssessment | null>(assessment || null)
  const [error, setError] = useState<string | undefined>(undefined)

  const submitForm = () => {
    if (!error) {
      assessorFormInstance.submit()
    }
  }

  const handleFormValidate = (values: FormValues) => {
    if (values.assessmentId === assessment?.assessmentId
       && assessment.assessor && values.assessorUserId === assessment.assessor.id) {
      return false
    }
    return combinedAssessorAssessments?.some(a => (
      a.assessmentId === values?.assessmentId
      && a.assessor?.id === values.assessorUserId))
  }

  const handleFormFinish = (values: FormValues) => {
    const validateForm = handleFormValidate(values)
    if (validateForm) {
      setError(I18n.t('admin.scheduling_errors_assessor_already_assigned'))
      return
    }
    const type = assessment ? 'update' : 'create'
    const selectedAssessment = campaignAssessorAssessments?.find(a => (
      a.assessmentId === values.assessmentId))
    const selectedAssessor = assessors?.find(assessor => assessor.userId === values.assessorUserId)
    if (!selectedAssessment || !selectedAssessor) return
    let meetingLink: string | null = null
    if (assessorFormInstance.getFieldValue('meetingType') !== 'not_available') {
      // eslint-disable-next-line prefer-destructuring
      meetingLink = values.meetingLink
    }
    const newAssessment: AssessorUserAssessment = {
      id: assessment?.id || selectedAssessment?.id,
      name: selectedAssessment.name,
      status: assessment?.status || 'not_started',
      meetingType: values.meetingType,
      linkedActivityId: selectedAssessment.linkedActivityId,
      linkedActivityName: selectedAssessment.linkedActivityName,
      meetingLink,
      assessmentId: values.assessmentId,
      assessor: { ...selectedAssessor, id: values.assessorUserId },
      scheduleTime: values.scheduleTime.format(),
      source: assessment?.source ? assessment.source : ASSESSMENT_SOURCE.CAMPAIGN_ASSESSOR_ASSESSMENTS,
    }
    onFormFinish(newAssessment, type, assessment)
    close()
  }

  const compatibleInitialData = useMemo(() => {
    if (!assessment) return {}
    return {
      meetingLink: assessment.meetingLink,
      meetingType: assessment.meetingType,
      assessmentId: assessment.assessmentId,
      assessorUserId: assessment.assessor?.id,
      scheduleTime: dayjs(assessment.scheduleTime || Date.now()),
    }
  }, [assessment])

  const meetingLinkFieldRules: FormRule[] = meetingType === 'custom'
    ? [{ required: true }, {
      type: 'url',
      message: I18n.t('admin.scheduling_errors_invalid_url'),
    }, {
      pattern: /^https:\/\/(.*)/,
      message: I18n.t('admin.scheduling_errors_meeting_link_https'),
    }] : [{ required: true }]

  const assessorsOptions = useMemo(() => {
    if (!assessors) return []
    if (assessment?.source === ASSESSMENT_SOURCE.ASSESSOR_USER_ASSESSMENT) {
      if (!assessment.assessor) return []
      return [{
        userId: assessment.assessor.id,
        name: assessment.assessor.name,
      }]
    }
    return assessors.map(assessor => ({
      userId: assessor.userId,
      name: assessor.name,
    }))
  }, [assessors, assessment])

  const assessmentOptions = useMemo(() => {
    if (assessment?.source === ASSESSMENT_SOURCE.ASSESSOR_USER_ASSESSMENT) {
      if (!assessment.assessmentId) return []
      return [{
        assessmentId: assessment.assessmentId,
        name: assessment.name,
      }]
    }
    return campaignAssessorAssessments
  }, [campaignAssessorAssessments, assessment])

  return (
    <Modal
      title={assessment ? I18n.t('admin.scheduling_subjects_edit_assessor_form')
        : I18n.t('admin.scheduling_subjects_add_assessor_form')}
      key="AssessorFormModal"
      open
      onCancel={close}
      onOk={submitForm}
    >
      {error && <div className="mbl"><Alert message={error} type="error" /></div>}
      <Form
        name="assessor_form"
        form={assessorFormInstance}
        labelAlign="left"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 24 }}
        className={styles.form}
        onFinish={values => handleFormFinish(values)}
        requiredMark={false}
        initialValues={compatibleInitialData}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item
          rules={[{ required: true, message: I18n.t('validations.blank') }]}
          label={I18n.t('admin.scheduling_add_assessor_form_assessment')}
          name="assessmentId"
        >
          <Select
            disabled={assessment?.source === ASSESSMENT_SOURCE.ASSESSOR_USER_ASSESSMENT}
            onChange={
              (value) => {
                setSelectedAssessment(combinedAssessorAssessments?.find(a => a.id === value) || null)
                setError(undefined)
              }
            }
          >
            {assessmentOptions?.map(assessment => (
              <Select.Option
                key={assessment.assessmentId}
                value={assessment.assessmentId}
              >
                {assessment.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: I18n.t('validations.blank') }]}
          label={I18n.t('admin.scheduling_add_assessor_form_assessor')}
          name="assessorUserId"
        >
          <Select
            disabled={assessment?.source === ASSESSMENT_SOURCE.ASSESSOR_USER_ASSESSMENT}
            onChange={() => setError(undefined)}
          >
            {assessorsOptions?.map(assessor => (
              <Select.Option
                key={assessor.userId}
                value={assessor.userId}
              >
                {assessor.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: I18n.t('validations.blank') }]}
          label={I18n.t('admin.scheduling_add_assessor_form_schedule_time')}
          name="scheduleTime"
        >
          <TimePicker
            className="w-100"
            format="hh:mm A"
            onChange={(value) => {
              const scheduleTimeWithWorkshopDate = mergeDateAndTime(dayjs(workshop?.startTime), value)
              assessorFormInstance.setFieldsValue({ scheduleTime: scheduleTimeWithWorkshopDate })
            }}
          />
        </Form.Item>
        {(selectedAssessment?.linkedActivityId && linkedAssessments?.get(selectedAssessment?.linkedActivityId)) && (
          <Form.Item
            className="mb-1"
            label={I18n.t('admin.scheduling_subjects_meeting_link_title')}
            name="meetingType"
          >
            <Radio.Group>
              <Radio value="not_available">{I18n.t('admin.scheduling_subjects_meeting_link_none')}</Radio>
              <Radio value="internal">{I18n.t('admin.scheduling_subjects_meeting_link_internal')}</Radio>
              <Radio value="custom">{I18n.t('admin.scheduling_subjects_meeting_link_custom')}</Radio>
            </Radio.Group>
          </Form.Item>
        )}
        {assessorFormInstance.getFieldValue('meetingType') === 'custom' ? (
          <Form.Item
            className="mb-0"
            wrapperCol={{ offset: 6 }}
            name="meetingLink"
            rules={[...meetingLinkFieldRules]}
          >
            <Input />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  )
}
