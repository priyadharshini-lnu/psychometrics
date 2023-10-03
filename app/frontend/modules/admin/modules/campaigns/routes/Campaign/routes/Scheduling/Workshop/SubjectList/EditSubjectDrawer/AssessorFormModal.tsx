import { FC, useState } from 'react'
import {
  Form, Modal, Select, TimePicker, Input, Radio,
} from 'antd'
import moment from 'moment'
import { Store } from 'antd/lib/form/interface'

import { Rule } from 'antd/lib/form'
import { mergeDateAndtime } from '~/utils/time'
import settings from '~/modules/admin/modules/campaigns/settings'
import styles from './EditSubjectDrawer.less'

const { I18n } = window

type OwnProps = {
  onFormFinish: (formValues: Store) => void
  initialFormData?: Store
  assessors?: Store[],
  assessments?: Store[],
  workshop?: Store,
  close: () => void
}

type Props = OwnProps

export const AssessorFormModal:FC<Props> = (props) => {
  const {
    close, onFormFinish, initialFormData, assessments, assessors, workshop,
  } = props
  const [assessorFormInstance] = Form.useForm()
  const [, setFields] = useState({})
  const [selectedAssessment, setSelectedAssessment] = useState(initialFormData)

  const submitForm = () => {
    assessorFormInstance.submit()
  }
  const handleFormFinish = (values) => {
    const currentAssessment = assessments?.find(assessment => assessment.id === values.name)
    const currentAssessor = assessors?.find(assessor => assessor.id === values.assessor)
    if (initialFormData) {
      onFormFinish({
        values:
        {
          ...values,
          name: initialFormData.name,
          assessor: { ...initialFormData.assessor, id: initialFormData.assessor?.id },
        },
        id: initialFormData.id,
      })
    } else {
      onFormFinish({
        values:
        {
          ...values,
          status: 'not_started',
          name: currentAssessment?.name,
          assessor: { ...currentAssessor, id: currentAssessor?.userId },
        },
        id: values.name,
      })
    }
    close()
  }

  const compatibleInitialData = initialFormData && {
    ...initialFormData,
    scheduleTime: moment(initialFormData.scheduleTime, settings.timeFormat),
    assessor: initialFormData.assessor?.name,
  }

  const meetingLinkType = assessorFormInstance.getFieldValue('meetingLinkType')
  const meetingLinkFieldRules: Rule[] = meetingLinkType === 'custom'
    ? [{ required: true }, {
      type: 'url',
      message: I18n.t('administration.scheduling.errors.invalid_url'),
    }, {
      pattern: /^https:\/\/(.*)/,
      message: I18n.t('administration.scheduling.errors.meeting_link_https'),
    }] : [{ required: true }]

  return (
    <Modal
      title={initialFormData ? I18n.t('administration.scheduling.subjects.edit_assessor_form')
        : I18n.t('administration.scheduling.subjects.add_assessor_form')}
      key="AssessorFormModal"
      open
      onCancel={close}
      onOk={submitForm}
    >
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
        <Form.Item rules={[{ required: true }]} label="Assessment" name="name">
          <Select
            disabled={initialFormData?.userAssessmentId}
            onChange={value => setSelectedAssessment(assessments?.filter(assessment => assessment.id === value)[0])}
          >
            {assessments?.map(assessment => (
              <Select.Option
                key={assessment.id}
                value={assessment.id}
              >
                {assessment.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="Assessor" name="assessor">
          <Select
            disabled={initialFormData?.userAssessmentId}
          >
            {assessors?.map(assessor => (
              <Select.Option
                key={assessor.id}
                value={assessor.id}
              >
                {assessor.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Schedule Time"
          name="scheduleTime"
        >
          <TimePicker
            className="w-100"
            format="hh:mm A"
            defaultValue={
              initialFormData?.scheduleTime ? moment(initialFormData.scheduleTime) : undefined
            }
            onChange={(value) => {
              const scheduleTimeWithWorkshopDate = mergeDateAndtime(
                moment(workshop?.startTime), value, workshop?.timezone,
              )
              assessorFormInstance.setFieldsValue({ scheduleTime: scheduleTimeWithWorkshopDate })
            }}
          />
        </Form.Item>
        {selectedAssessment?.linkedActivity === selectedAssessment?.subjectLinkedActivity && (
          <Form.Item
            className="mb-1"
            label={I18n.t('administration.scheduling.subjects.meeting_link_title')}
            name="meetingLinkType"
          >
            <Radio.Group>
              <Radio value="none">{I18n.t('administration.scheduling.subjects.meeting_link_none')}</Radio>
              <Radio value="internal">{I18n.t('administration.scheduling.subjects.internal')}</Radio>
              <Radio value="custom">{I18n.t('administration.scheduling.subjects.meeting_link_custom')}</Radio>
            </Radio.Group>
          </Form.Item>
        )}
        {assessorFormInstance.getFieldValue('meetingLinkType')
        && assessorFormInstance.getFieldValue('meetingLinkType') === 'custom' ? (
          <Form.Item
            className="mb-0"
            wrapperCol={{ offset: 6 }}
            name="meetingLinkUrl"
            rules={[...meetingLinkFieldRules]}
          >
            <Input />
          </Form.Item>
          ) : null}
      </Form>
    </Modal>
  )
}
