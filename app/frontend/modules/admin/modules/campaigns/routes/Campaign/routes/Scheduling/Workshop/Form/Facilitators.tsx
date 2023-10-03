import _ from 'lodash'
import React, { useState } from 'react'
import {
  Form, Space, Button, Collapse, Alert, Typography, InputNumber, Input, Row, Col,
} from 'antd'
import moment from 'moment'
import { Store } from 'antd/lib/form/interface'
import { useParams } from 'react-router-dom'
import { FormInstance } from 'antd/es/form/Form'
import { Panel, UsersSelectWithTags } from '~/glint'
import styles from './Form.less'
import { ResourcesItems } from './ResourcesItems'
import { useResources } from '~/hooks/useResources'
import {
  WorkshopCreateResponseTR, Workshop, UserDetails, userDetailsListTR,
} from '~/modules/admin/modules/campaigns/core/workshop'
import { secondsToDayHoursAndMinutes, mergeDateAndtime } from '~/utils/time'
import { formatWorkshopDate } from '~/utils/workshop'

const { Title } = Typography
const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

interface Props {
  basicInfoData: {
    dates: moment.Moment[]
    time: moment.Moment
    duration: number
    timezone: string
    video_call_type: number
    meeting_link: string
    workshop_resources: {
      key: number
      name: string
      url: string
    }[]
  }
  onPrevious: () => void
  onCancel?: () => void
  onSubmit: (workshop) => void
}

interface Errors {
  title: number
  detail?: string
}

const { I18n } = window

export const Facilitators: React.FC<Props> = ({
  basicInfoData, onCancel, onPrevious, onSubmit,
}) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { projectId } = useParams<{ projectId: string }>()

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
  const [managers, setManagers] = useState<UserDetails[]>([])
  const [assessors, setAssessors] = useState<UserDetails[]>([])

  const {
    collectionAction: collectionActionFacilitators,
  } = useResources(
    'workshop_facilitators',
    { responseType: userDetailsListTR },
  )

  const startDateTime = index => (
    mergeDateAndtime(basicInfoData.dates[index], basicInfoData.time, basicInfoData.timezone)
  )

  const endDateTime = index => (
    startDateTime(index).add(moment.duration(basicInfoData.duration, 'seconds'))
  )

  const searchFacilitators = (value, index, action) => collectionActionFacilitators({
    action,
    method: 'get',
    body: {
      startDateTime: startDateTime(index).format(),
      endDateTime: endDateTime(index).format(),
      campaignId,
      projectId,
      searchTerm: value,
    },
  })

  const [errors, setErrors] = useState<Errors[]>()
  const [disableCreate, setDisableCreate] = useState(false)

  const datesCount = basicInfoData.dates.length

  const workshopResources = basicInfoData.workshop_resources || [{ key: 1, name: '', url: '' }]
  const workshopNames = basicInfoData.dates.map((_, i) => formatWorkshopDate(startDateTime(i)))

  const [formData, setFormData] = useState<Store[]>(Array.from({ length: datesCount }, () => ({})))
  const [assessorIds, setAssessorIds] = useState<Store[]>(Array.from({ length: datesCount }, () => ({})))
  const [centerManagerIds, setCenterManagerIds] = useState<Store[]>(Array.from({ length: datesCount }, () => ({})))

  const basicInfoDataWithoutDates = _.omit(basicInfoData, 'dates')

  const forms: FormInstance[] = Array.from({ length: datesCount })

  const handleSubmit = () => {
    const formPromises = forms.map(f => f.validateFields())
    Promise.all(formPromises).then(() => {
      collectionAction(
        {
          action: 'create_bulk_workshops',
          method: 'post',
          responseType: WorkshopCreateResponseTR,
          body: {
            workshops: formData,
          },
        },
      ).catch((errors) => {
        setErrors(errors.base)
      }).then((response) => {
        setDisableCreate(true)
        onSubmit(response)
      })
    }).catch(() => {})
  }

  const handleCancel = () => {
    onCancel?.()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterInvalidResources = (resources: any[]) => resources.filter(r => r && r?.name?.length && r?.url?.length)

  const handleFormChange = (index, formValues) => {
    const { workshop_resources: formWorkshopResources } = formValues
    const updatedFormsData = [...formData]
    updatedFormsData[index] = { ...updatedFormsData[index], ...basicInfoDataWithoutDates }
    updatedFormsData[index].name = formValues.name ?? workshopNames[index]
    updatedFormsData[index].start_time = startDateTime(index).format()
    updatedFormsData[index] = _.omit(updatedFormsData[index], 'time')
    updatedFormsData[index].assessor_ids = assessorIds[index].length ? assessorIds[index] : []
    updatedFormsData[index].center_manager_ids = centerManagerIds[index].length ? centerManagerIds[index] : []
    updatedFormsData[index].total_seats = formValues.total_seats
    updatedFormsData[index].workshop_resources = filterInvalidResources(
      formWorkshopResources ?? updatedFormsData[index].workshop_resources,
    )
    updatedFormsData[index].video_call_type = formValues.video_call_type ?? updatedFormsData[index].video_call_type
    updatedFormsData[index].meeting_link = formValues.meeting_link ?? updatedFormsData[index].meeting_link
    setFormData(updatedFormsData)
  }

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      {_.times(datesCount, (index) => {
        const [form] = Form.useForm()
        forms[index] = form
        return (
          <React.Fragment key={index}>
            <Panel
              key={index}
              title={basicInfoData.dates[index].format('Do MMMM, YYYY')}
              collapsible
              additionalDetailsLabelStyle={{ color: '#808080' }}
              additionalDetails={[
                {
                  label: I18n.t('administration.scheduling.assessment_center_form.timezone_label'),
                  value: basicInfoData.timezone,
                },
                {
                  label: I18n.t('administration.scheduling.assessment_center_form.duration_label'),
                  value: secondsToDayHoursAndMinutes(basicInfoData.duration),
                },
                {
                  label: I18n.t('administration.scheduling.assessment_center_form.time_label'),
                  value: formatWorkshopDate(startDateTime(index)),
                },
              ]}
              footer={
                (
                  <>
                    <Form
                      requiredMark={false}
                      className={styles.form}
                      layout="vertical"
                      key={`form${index}`}
                      form={form}
                      initialValues={
                        {
                          workshop_resources: workshopResources,
                          video_call_type: basicInfoData.video_call_type || 0,
                          meeting_link: basicInfoData.meeting_link || '',
                        }
                      }
                      onValuesChange={(_, values) => handleFormChange(index, values)}
                    >
                      <Collapse ghost>
                        <Collapse.Panel
                          header={(
                            <Title level={5}>
                              {I18n.t('administration.scheduling.assessment_center_form.meetings_and_resources')}
                            </Title>
                          )}
                          key="1"
                        >
                          <ResourcesItems
                            videoCallTypeValue={basicInfoData.video_call_type}
                            showMeetigOption
                          />
                        </Collapse.Panel>
                      </Collapse>
                    </Form>
                  </>
                )
              }
            >
              {errors?.length && errors.map((object, index) => (
                object.title === index && (
                  <Alert
                    key={index}
                    message={false}
                    description={object.detail}
                    type="error"
                    className="mbm"
                  />
                )
              ))}
              <Form
                requiredMark={false}
                className={styles.form}
                layout="vertical"
                key={`form${index}`}
                form={form}
                initialValues={{ name: workshopNames[index], workshop_resources: workshopResources }}
                onValuesChange={(_, values) => handleFormChange(index, values)}
              >
                <Input.Group>
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        label={I18n.t('administration.scheduling.assessment_center_form.name_label')}
                        name="name"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={4}>
                      <Form.Item
                        label={I18n.t('administration.scheduling.assessment_center_form.seats_label')}
                        name="total_seats"
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
                </Input.Group>
                <Form.Item
                  name="center_manager_ids"
                  label={I18n.t('administration.scheduling.assessment_center_form.manager_ids_label')}
                  {...fieldLayout}
                >
                  <UsersSelectWithTags
                    preSelectedUsers={[]}
                    users={managers}
                    onUserSearch={(value) => {
                      searchFacilitators(value, index, 'search_managers').then((data: UserDetails[]) => {
                        setManagers(data)
                      })
                    }}
                    onChange={(values) => {
                      centerManagerIds[index] = values
                      setCenterManagerIds(centerManagerIds)
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="assessor_ids"
                  label={I18n.t('administration.scheduling.assessment_center_form.assessor_ids_label')}
                  {...fieldLayout}
                >
                  <UsersSelectWithTags
                    preSelectedUsers={[]}
                    users={assessors}
                    onUserSearch={(value) => {
                      searchFacilitators(value, index, 'search_assessors').then((data: UserDetails[]) => {
                        setAssessors(data)
                      })
                    }}
                    onChange={(values) => {
                      assessorIds[index] = values
                      setAssessorIds(assessorIds)
                    }}
                  />
                </Form.Item>
              </Form>
            </Panel>
          </React.Fragment>
        )
      })}
      <div className={styles.footer}>
        <Space>
          {
            onCancel && (
              <Button onClick={handleCancel} disabled={createWorkshopInProgress}>
                {I18n.t('common.actions.cancel')}
              </Button>
            )
          }
          <Button onClick={onPrevious} disabled={disableCreate || createWorkshopInProgress}>
            {I18n.t('administration.scheduling.assessment_center_form.back')}
          </Button>
          <Button loading={createWorkshopInProgress} type="primary" onClick={handleSubmit} disabled={disableCreate}>
            {I18n.t('administration.scheduling.assessment_center_form.create')}
          </Button>
        </Space>
      </div>
    </Space>
  )
}
