import { FC, useState } from 'react'
import {
  Form, Modal, Select, TimePicker, Input, Radio,
} from 'antd'
import moment from 'moment'
import { Store } from 'antd/lib/form/interface'

import { Rule } from 'antd/lib/form'
import { mergeDateAndTime } from '~/utils/time'
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
  const meetingType = Form.useWatch('meetingType', assessorFormInstance)
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
          assessor: {
            id: currentAssessor?.userId || initialFormData.assessor?.id,
            name: currentAssessor?.name || initialFormData.assessor?.name,
            photoUrl: currentAssessor?.photoUrl || initialFormData.assessor?.photoUrl,
          },
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

  const meetingLinkFieldRules: Rule[] = meetingType === 'custom'
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
        <Form.Item
          rules={[{ required: true, message: I18n.t('validations.blank') }]}
          label={I18n.t('administration.scheduling.add_assessor_form.assessment')}
          name="name"
        >
          <Select
            disabled={initialFormData?.assessorUserAssessmentId}
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
        <Form.Item
          rules={[{ required: true, message: I18n.t('validations.blank') }]}
          label={I18n.t('administration.scheduling.add_assessor_form.assessor')}
          name="assessor"
        >
          <Select
            disabled={initialFormData?.assessorUserAssessmentId}
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
          rules={[{ required: true, message: I18n.t('validations.blank') }]}
          label={I18n.t('administration.scheduling.add_assessor_form.schedule_time')}
          name="scheduleTime"
        >
          <TimePicker
            className="w-100"
            format="hh:mm A"
            defaultValue={
              initialFormData?.scheduleTime ? moment(initialFormData.scheduleTime) : undefined
            }
            onChange={(value) => {
              const scheduleTimeWithWorkshopDate = mergeDateAndTime(moment(workshop?.startTime), value)
              assessorFormInstance.setFieldsValue({ scheduleTime: scheduleTimeWithWorkshopDate })
            }}
          />
        </Form.Item>
        {selectedAssessment?.subjectLinkedActivityPresent && (
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
        {meetingType && meetingType === 'custom' ? (
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
