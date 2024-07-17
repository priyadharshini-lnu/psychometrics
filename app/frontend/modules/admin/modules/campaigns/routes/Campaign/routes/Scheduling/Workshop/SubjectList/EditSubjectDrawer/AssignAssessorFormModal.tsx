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
      setError(I18n.t('administration.scheduling.errors.assessor_already_assigned'))
      return
    }
    const type = assessment ? 'update' : 'create'
    const selectedAssessment = campaignAssessorAssessments?.find(a => (
      a.assessmentId === values.assessmentId))
    const selectedAssessor = assessors?.find(assessor => assessor.userId === values.assessorUserId)
    if (!selectedAssessment || !selectedAssessor) return
    const newAssessment: AssessorUserAssessment = {
      id: selectedAssessment?.id,
      name: selectedAssessment.name,
      status: assessment?.status || 'not_started',
      meetingType: values.meetingType,
      linkedActivityId: selectedAssessment.linkedActivityId,
      meetingLink: selectedAssessment?.meetingType === 'not_available' ? null : (assessment?.meetingLink || null),
      assessmentId: values.assessmentId,
      assessor: { ...selectedAssessor, id: values.assessorUserId },
      scheduleTime: values.scheduleTime.format('YYYY-MM-DD HH:mm:ss'),
      source: selectedAssessment.source ? selectedAssessment.source : ASSESSMENT_SOURCE.CAMPAIGN_ASSESSOR_ASSESSMENTS,
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
      message: I18n.t('administration.scheduling.errors.invalid_url'),
    }, {
      pattern: /^https:\/\/(.*)/,
      message: I18n.t('administration.scheduling.errors.meeting_link_https'),
    }] : [{ required: true }]

  return (
    <Modal
      title={assessment ? I18n.t('administration.scheduling.subjects.edit_assessor_form')
        : I18n.t('administration.scheduling.subjects.add_assessor_form')}
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
          label={I18n.t('administration.scheduling.add_assessor_form.assessment')}
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
            {campaignAssessorAssessments?.map(assessment => (
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
          label={I18n.t('administration.scheduling.add_assessor_form.assessor')}
          name="assessorUserId"
        >
          <Select
            disabled={assessment?.source === ASSESSMENT_SOURCE.ASSESSOR_USER_ASSESSMENT}
            onChange={() => setError(undefined)}
          >
            {assessors?.map(assessor => (
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
          label={I18n.t('administration.scheduling.add_assessor_form.schedule_time')}
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
            label={I18n.t('administration.scheduling.subjects.meeting_link_title')}
            name="meetingType"
          >
            <Radio.Group>
              <Radio value="not_available">{I18n.t('administration.scheduling.subjects.meeting_link_none')}</Radio>
              <Radio value="internal">{I18n.t('administration.scheduling.subjects.meeting_link_internal')}</Radio>
              <Radio value="custom">{I18n.t('administration.scheduling.subjects.meeting_link_custom')}</Radio>
            </Radio.Group>
          </Form.Item>
        )}
        {assessment?.meetingType && assessment.meetingType === 'custom' ? (
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
