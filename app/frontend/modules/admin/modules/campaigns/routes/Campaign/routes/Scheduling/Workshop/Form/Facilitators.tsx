import _ from 'lodash'
import React, { useState } from 'react'
import {
  Form, Space, Button, Collapse, Typography, InputNumber, Input, Row, Col,
} from 'antd'
import { useParams } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import { Panel, UsersSelectWithTags } from '~/glint'
import styles from './Form.less'
import { ResourcesItems } from './ResourcesItems'
import { useResources } from '~/hooks/useResources'
import {
  WorkshopCreateResponseTR, Workshop, UserDetails, userDetailsListTR,
} from '~/modules/admin/modules/campaigns/core/workshop'
import { secondsToDayHoursAndMinutes, mergeDateAndTime } from '~/utils/time'
import { formatWorkshopDate } from '~/utils/workshop'

const { Title } = Typography
const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

interface Props {
  basicInfoData: {
    dates: dayjs.Dayjs[]
    time: dayjs.Dayjs
    duration: number
    timezone: string
    video_call_type: number
    meeting_link: string
    cancellation_lead_time: number
    allow_late_cancellation_and_rescheduling: boolean
    disable_cancellation_and_rescheduling: boolean
    scheduling_lead_time: number
    workshop_resources: {
      key: number
      name: string
      url: string
    }[]
    campaignAssessmentGroupId: number,
  }
  onPrevious: () => void
  onCancel?: () => void
  onSubmit: (workshop) => void
}

interface WorkshopResource {
  name: string, url: string
}
interface Errors {
  title: number
  detail?: string
}

const { I18n } = window

export const Facilitators: React.FC<Props> = ({
  basicInfoData, onCancel, onPrevious, onSubmit,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
  const { projectId } = useParams() as { projectId: string }

  const {
    collectionAction,
    isLoading: requestLoading,
  } = useResources<Workshop>(
    'workshops',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: WorkshopCreateResponseTR,
    },
  )
  const createWorkshopInProgress = requestLoading('post/create_bulk_workshops')

  const startDateTime = date => (
    mergeDateAndTime(date, basicInfoData.time, basicInfoData.timezone)
  )

  const [errors, setErrors] = useState<Errors[]>()
  const [disableCreate, setDisableCreate] = useState(false)

  const [managers, setManagers] = useState<UserDetails[]>([])
  const [assessors, setAssessors] = useState<UserDetails[]>([])

  const transformData = facilitator => ({
    ...facilitator,
    duration: basicInfoData.duration,
    cancellation_lead_time: basicInfoData.cancellation_lead_time,
    scheduling_lead_time: basicInfoData.scheduling_lead_time,
    allow_late_cancellation_and_rescheduling: basicInfoData.allow_late_cancellation_and_rescheduling,
    disable_cancellation_and_rescheduling: basicInfoData.disable_cancellation_and_rescheduling,
    timezone: basicInfoData.timezone,
    workshop_resources: filterInvalidResources(facilitator.workshop_resources),
    campaignAssessmentGroupId: basicInfoData.campaignAssessmentGroupId,
    video_call_type: facilitator.video_call_type ?? basicInfoData.video_call_type ?? 0,
    meeting_link: facilitator.meeting_link ?? basicInfoData.meeting_link,
  })

  const handleSubmit = async () => {
    const data = form.getFieldsValue()

    const formData = data.facilitators.map(facilitator => transformData(facilitator))

    form.validateFields().then(() => {
      collectionAction(
        {
          action: 'create_bulk_workshops',
          method: 'post',
          responseType: WorkshopCreateResponseTR,
          body: {
            workshops: formData,
          },
        },
      ).then((response) => {
        setDisableCreate(true)
        onSubmit(response)
      }).catch((errors) => {
        setErrors(errors)
      })
    }).catch(() => {

    })
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const filterInvalidResources = (resources: WorkshopResource[] = []) => resources.filter(
    r => r && r?.name?.length && r?.url?.length,
  )

  const copyToAll = (formName) => {
    const values = form.getFieldValue(['facilitators', formName])

    const valuesToCopy = _.pick<{
      video_call_type?: string,
      meeting_link?: string,
      workshop_resources?: WorkshopResource[]
    }>(values, ['total_seats', 'assessor_ids', 'center_manager_ids'])

    if (values.video_call_type) {
      valuesToCopy.video_call_type = values.video_call_type
    }
    if (values.meeting_link) {
      valuesToCopy.meeting_link = values.meeting_link
    }
    if (values.workshop_resources) {
      valuesToCopy.workshop_resources = values.workshop_resources
    }

    valuesToCopy.workshop_resources = filterInvalidResources(valuesToCopy.workshop_resources)

    basicInfoData.dates.map((_d, i) => {
      if (i === formName) return
      const values = form.getFieldValue(['facilitators', i])

      form.setFieldValue(['facilitators', i], { ...values, ...valuesToCopy })
    })
  }

  const [form] = Form.useForm()

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className={styles.form}
        initialValues={{
          facilitators: basicInfoData.dates.map(d => ({
            name: formatWorkshopDate(mergeDateAndTime(d, basicInfoData.time, basicInfoData.timezone)),
            start_time: startDateTime(d).format(),
            assessor_ids: [],
            center_manager_ids: [],
            workshop_resources: basicInfoData.workshop_resources,
            video_call_type: basicInfoData.video_call_type || 0,
            meeting_link: basicInfoData.meeting_link || '',
          })),
        }}
      >
        <Form.List name="facilitators">
          {fields => fields.map(field => (
            <FacilitatorsForm
              date={basicInfoData.dates[field.name]}
              campaignId={campaignId}
              projectId={projectId}
              key={field.key}
              field={field}
              basicInfoData={basicInfoData}
              copyToAll={copyToAll}
              managers={managers}
              assessors={assessors}
              setManagers={setManagers}
              setAssessors={setAssessors}
              errors={errors}
            />
          ))}
        </Form.List>
      </Form>
      <div className={styles.footer}>
        <Space>
          {
            onCancel && (
              <Button onClick={handleCancel} disabled={createWorkshopInProgress}>
                {I18n.t('shared.cancel')}
              </Button>
            )
          }
          <Button onClick={onPrevious} disabled={disableCreate || createWorkshopInProgress}>
            {I18n.t('shared.back')}
          </Button>
          <Button loading={createWorkshopInProgress} type="primary" onClick={handleSubmit} disabled={disableCreate}>
            {I18n.t('shared.create')}
          </Button>
        </Space>
      </div>
    </Space>
  )
}

const FacilitatorsForm = ({
  campaignId, projectId, field, date, basicInfoData,
  errors, copyToAll, managers, assessors, setManagers, setAssessors,
}) => {
  const {
    collectionAction: collectionActionFacilitators,
  } = useResources(
    'workshop_facilitators',
    { responseType: userDetailsListTR },
  )

  const startDateTime = mergeDateAndTime(date, basicInfoData.time, basicInfoData.timezone)

  const endDateTime = startDateTime.add(dayjs.duration(basicInfoData.duration, 'seconds'))

  const searchFacilitators = (value, action) => collectionActionFacilitators({
    action,
    method: 'get',
    body: {
      startDateTime: startDateTime.format(),
      endDateTime: endDateTime.format(),
      campaignId,
      projectId,
      searchTerm: value,
    },
  })

  const assessorError = errors && errors[`workshops/${field.name}/assessorIds`]
  const managerError = errors && errors[`workshops/${field.name}/managerIds`]

  return (
    <Panel
      className="mb-4"
      title={date.format('Do MMMM, YYYY')}
      collapsible
      additionalDetailsLabelStyle={{ color: '#808080' }}
      additionalDetails={[
        {
          label: I18n.t('admin.timezone_label'),
          value: basicInfoData.timezone,
        },
        {
          label: I18n.t('admin.duration_label'),
          value: secondsToDayHoursAndMinutes(basicInfoData.duration),
        },
        {
          label: I18n.t('admin.time_label'),
          value: formatWorkshopDate(startDateTime),
        },
      ]}
      footer={(
        <>
          <Collapse ghost>
            <Collapse.Panel
              header={(
                <Title level={5}>
                  {I18n.t('admin.meetings_and_resources')}
                </Title>
                  )}
              key="1"
            >
              <ResourcesItems
                fieldName={field.name}
                videoCallTypeValue={basicInfoData.video_call_type}
                showMeetigOption
                validationsErrors={errors}
              />
            </Collapse.Panel>
          </Collapse>
          {basicInfoData.dates.length > 1 && field.name === 0 && (
            <div className="mt-4">
              <Button onClick={() => copyToAll(field.name)}>
                {I18n.t('admin.copy_to_all')}
              </Button>
              <div className={styles.hint}>
                {I18n.t('admin.copy_hint')}
              </div>
            </div>
          )}
        </>
      )}
    >
      <Row gutter={16}>
        <Col xs={24} sm={20}>
          <Form.Item
            label={I18n.t('shared.name')}
            name={[field.name, 'name']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={4}>
          <Form.Item
            label={I18n.t('admin.seats_label')}
            name={[field.name, 'total_seats']}
            rules={[
              {
                required: true,
                message: I18n.t('validations.blank'),
              },
              { type: 'number', min: 1 },
            ]}
          >
            <InputNumber placeholder="e.g 2,3,..." style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name={[field.name, 'center_manager_ids']}
        label={I18n.t('admin.manager_ids_label')}
        help={managerError ? managerError.title : undefined}
        validateStatus={managerError ? 'error' : undefined}
        status={managerError ? 'error' : undefined}
        {...fieldLayout}
      >
        <UsersSelectWithTags
          preSelectedUsers={[]}
          users={managers}
          onUserSearch={(value) => {
            searchFacilitators(value, 'search_managers').then((data: UserDetails[]) => {
              setManagers(data)
            })
          }}
        />
      </Form.Item>
      <Form.Item
        name={[field.name, 'assessor_ids']}
        label={I18n.t('admin.assessor_ids_label')}
        help={assessorError ? assessorError.title : undefined}
        validateStatus={assessorError ? 'error' : undefined}
        status={assessorError ? 'error' : undefined}
        {...fieldLayout}
      >
        <UsersSelectWithTags
          preSelectedUsers={[]}
          users={assessors}
          onUserSearch={(value) => {
            searchFacilitators(value, 'search_assessors').then((data: UserDetails[]) => {
              setAssessors(data)
            })
          }}
        />
      </Form.Item>
      <Form.Item name={[field.name, 'start_time']} hidden />
    </Panel>
  )
}
