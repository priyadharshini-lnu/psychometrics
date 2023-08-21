import _ from 'lodash'
import React, { useState } from 'react'
import {
  Form, Space, Button, Input, Collapse, Alert, Typography,
} from 'antd'
import * as t from 'io-ts'
import moment from 'moment'
import { Store } from 'antd/lib/form/interface'
import { useParams } from 'react-router-dom'
import debounce from 'lodash/debounce'

import { Panel, UsersSelectWithTags } from '~/glint'
import styles from './Form.less'
import { ResourcesItems } from './ResourcesItems'
import { useResources } from '~/hooks/useResources'
import {
  WorkshopCreateResponseTR, Workshop, UserDetails, userDetailsListTR,
} from '~/modules/admin/modules/campaigns/core/workshop'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

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
}

interface Errors {
  title: number
  detail?: string
}

const { I18n } = window

export const Facilitators: React.FC<Props> = ({ basicInfoData, onPrevious }) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { projectId } = useParams<{ projectId: string }>()

  const {
    collectionAction,
  } = useResources<Workshop>(
    'workshops',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: WorkshopCreateResponseTR,
    },
  )
  const [users, setUsers] = useState<UserDetails[]>([])

  const {
    collectionAction: collectionActionFacilitators,
  } = useResources(
    'workshop_facilitators',
    { responseType: t.array(userDetailsListTR) },
  )

  const startDateTime = index => (
    moment.tz(basicInfoData.dates[index].format('YYYY-MM-DD'), basicInfoData.timezone).set({
      hour: basicInfoData.time.hour(),
      minute: basicInfoData.time.minute(),
    })
  )

  const endDateTime = index => (
    startDateTime(index).add(moment.duration(basicInfoData.duration, 'seconds'))
  )

  const searchFacilitators = debounce((value, index, action) => {
    collectionActionFacilitators({
      action,
      method: 'get',
      body: {
        startDateTime: startDateTime(index).format(),
        endDateTime: endDateTime(index).format(),
        campaignId,
        projectId,
        searchTerm: value,
      },
    }).then((data: UserDetails[]) => {
      setUsers(data)
    })
  }, 50)

  const [errors, setErrors] = useState<Errors[]>()
  const [disableCreate, setDisableCreate] = useState(false)

  const datesCount = basicInfoData.dates.length

  const workshopResources = basicInfoData.workshop_resources || [{ key: 1, name: '', url: '' }]

  const [formData, setFormData] = useState<Store[]>(Array.from({ length: datesCount }, () => ({})))
  const [assessorIds, setAssessorIds] = useState<Store[]>(Array.from({ length: datesCount }, () => ({})))
  const [centerManagerIds, setCenterManagerIds] = useState<Store[]>(Array.from({ length: datesCount }, () => ({})))

  const basicInfoDataWithoutDates = _.omit(basicInfoData, 'dates')

  const handleSubmit = () => {
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
    }).then(() => {
      setDisableCreate(true)
    })
  }

  const handleFormChange = (index) => {
    const updatedFormsData = [...formData]
    updatedFormsData[index] = { ...updatedFormsData[index], ...basicInfoDataWithoutDates }
    updatedFormsData[index].start_time = startDateTime(index).format()
    updatedFormsData[index] = _.omit(updatedFormsData[index], 'time')
    updatedFormsData[index].assessor_ids = assessorIds[index].length ? assessorIds[index] : []
    updatedFormsData[index].center_manager_ids = centerManagerIds[index].length ? centerManagerIds[index] : []
    setFormData(updatedFormsData)
  }

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      {_.times(datesCount, (index) => {
        const [form] = Form.useForm()

        return (
          <>
            <Panel
              title={basicInfoData.dates[index].format('Do, MMMM, YYYY')}
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
                  value: startDateTime(index).format('YYYY-MM-DD hh:mm A Z'),
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
                      onValuesChange={() => handleFormChange(index)}
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
              {errors?.length && errors.map(object => (
                object.title === index && (
                  <Alert
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
                initialValues={{ workshop_resources: workshopResources }}
                onValuesChange={() => handleFormChange(index)}
              >
                <Form.Item
                  label={I18n.t('administration.scheduling.assessment_center_form.seats_label')}
                  name="total_seats"
                  {...fieldLayout}
                  wrapperCol={{ span: '4' }}
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g 2,3,..." />
                </Form.Item>
                <Form.Item
                  name="center_manager_ids"
                  label={I18n.t('administration.scheduling.assessment_center_form.manager_ids_label')}
                  {...fieldLayout}
                >
                  <UsersSelectWithTags
                    preSelectedUsers={[]}
                    users={users}
                    onUserSearch={(value) => {
                      searchFacilitators(value, index, 'search_managers')
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
                    users={users}
                    onUserSearch={(value) => {
                      searchFacilitators(value, index, 'search_assessors')
                    }}
                    onChange={(values) => {
                      assessorIds[index] = values
                      setAssessorIds(assessorIds)
                    }}
                  />
                </Form.Item>
              </Form>
            </Panel>
          </>
        )
      })}
      <div className={styles.footer}>
        <Space>
          <Button onClick={onPrevious}>
            {I18n.t('administration.scheduling.assessment_center_form.back')}
          </Button>
          <Button type="primary" onClick={handleSubmit} disabled={disableCreate}>
            {I18n.t('administration.scheduling.assessment_center_form.create')}
          </Button>
        </Space>
      </div>
    </Space>
  )
}
