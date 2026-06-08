import _ from 'lodash'
import { FC, useState, useEffect } from 'react'
import {
  Form, Typography, InputNumber, Input, Radio, Switch, Select, Row, Col, DatePicker, TimePicker,
} from 'antd'
import { useParams } from 'react-router-dom'
import InputDuration from '~/components/InputDuration'
import dayjs from '~/utils/dayjs'
import ResourceFormModal from '~/components/ResourceFormModal'
import {
  UserDetails, userDetailsListTR, Workshop,
} from '~/modules/admin/modules/campaigns/core/workshop'
import { UsersSelectWithTags } from '~/glint'
import { useResources } from '~/hooks/useResources'
import { mergeDateAndTime } from '~/utils/time'
import { formatWorkshopDate } from '~/utils/workshop'

const { I18n } = window
const { Text } = Typography

type Props = {
  close: () => void
  workshop: Workshop
  updateWorkshop: (data) => Promise<Workshop>
}

const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

interface AssessmentCenterGroup {
  id: string
  name: string
}

const startDateTime = (date, time, timezone) => (
  mergeDateAndTime(date, time, timezone)
)

export const WorkshopEditFormModal: FC<Props> = ({
  close,
  workshop,
  updateWorkshop,
}) => {
  const [form] = Form.useForm()
  const disableCancellationAndRescheduling = Form.useWatch('disableCancellationAndRescheduling', form)
  const [workshopManagers, setWorkshopManagers] = useState<UserDetails[]>([])
  const [workshopAssessors, setWorkshopAssessors] = useState<UserDetails[]>([])
  const { campaignId } = useParams() as { campaignId: string }
  const { projectId } = useParams() as { projectId: string }

  const {
    collectionAction,
  } = useResources(
    'workshop_facilitators',
    { responseType: userDetailsListTR },
  )

  const {
    collectionAction: assessmentGroupsAction,
  } = useResources<AssessmentCenterGroup>(
    'campaign_assessment_groups',
    {
      basePath: `campaigns/${campaignId}`,
    },
  )

  const [assessmentCenterGroups, setAssessmentCenterGroups] = useState<AssessmentCenterGroup[]>([])

  useEffect(() => {
    assessmentGroupsAction({
      action: '',
      method: 'get',
      apiConfig: {
        filter: { group_type_eq: '1' },
      },
    })
      .then((response) => {
        setAssessmentCenterGroups(response as AssessmentCenterGroup[])
      })
      .catch((error) => {
        console.error('Failed to load assessment center groups:', error)
      })
  }, [campaignId])

  const [videoCallType, setVideoCallType] = useState<string>(workshop.videoCallType)

  useEffect(() => {
    form.setFieldValue('workshopManagersIds', _.map(workshop.workshopManagers, 'userId').map(id => id?.toString()))
    form.setFieldValue('workshopAssessorsIds', _.map(workshop.workshopAssessors, 'userId').map(id => id?.toString()))
    form.setFieldValue('campaignAssessmentGroupId', workshop.campaignAssessmentGroupId)
  }, [workshop])

  const handleSearch = (_.debounce((searchKey, action) => {
    collectionAction({
      action,
      method: 'get',
      body: {
        startDateTime: workshop.startTime,
        endDateTime: dayjs(workshop.startTime).add(workshop.duration, 's').tz(workshop.timezone).format(),
        campaignId,
        projectId,
        searchTerm: searchKey,
      },
    }).then((data: UserDetails[]) => {
      action === 'search_managers' ? setWorkshopManagers(data) : setWorkshopAssessors(data)
    })
  }, 500))

  return (
    <ResourceFormModal
      resourceName="workshop"
      resource={workshop}
      readableResourceName="Workshop"
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 700 }}
      formProps={{
        initialValues: {
          date: workshop.startTime ? dayjs(workshop.startTime) : undefined,
          time: workshop.startTime ? dayjs(workshop.startTime).tz(workshop.timezone) : undefined,
        },
      }}
      request={{
        updateResource: (data: { workshopManagersIds: string[], workshopAssessorsIds: string[],
          date: string, time: string, name?: string }) => {
          const {
            date, time, name, ...cleanedData
          } = data

          let startTime: string | undefined
          if (date && time) {
            startTime = startDateTime(date, time, workshop.timezone)?.format()
          }

          return updateWorkshop({
            ...cleanedData,
            workshopManagersIds: (data.workshopManagersIds || []).map(id => id.toString()),
            workshopAssessorsIds: (data.workshopAssessorsIds || []).map(id => id.toString()),
            ...(startTime ? { start_time: startTime } : {}),
            name: name || (startTime && formatWorkshopDate(dayjs(startTime).tz(workshop.timezone))),
          })
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input name="workshop_name" />
          </Form.Item>
          {!(workshop.bookedSeats > 0) && (
            <Row gutter={16}>
              <Col xs={12} lg={8}>
                <Form.Item
                  name="date"
                  label={I18n.t('licenses.start_date')}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} lg={8}>
                <Form.Item
                  name="time"
                  label={I18n.t('admin.time_label')}
                >
                  <TimePicker
                    format="h:mm A"
                    use12Hours
                    minuteStep={15}
                    showNow={false}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="campaignAssessmentGroupId"
            label={I18n.t('admin.assessment_center_group')}
            {...fieldLayout}
            rules={[{ required: true }]}
          >
            <Select>
              {_.map(assessmentCenterGroups, (assessmentCenterGroup: AssessmentCenterGroup) => (
                <Select.Option key={assessmentCenterGroup.id} value={assessmentCenterGroup.id}>
                  {assessmentCenterGroup.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {!disableCancellationAndRescheduling && (
            <>
              <Form.Item
                label={
                  I18n.t(
                    'admin.allow_late_cancellation_and_scheduling',
                  )
                }
                name="allowLateCancellationAndRescheduling"
                rules={[{ required: true }]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
          <Form.Item
            label={I18n.t('admin.video_call_type_label')}
            name="videoCallType"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={(e) => { setVideoCallType(e.target.value) }}>
              <Radio value="not_available">
                {I18n.t('admin.video_call_type_none')}
              </Radio>
              <Radio value="internal">
                {I18n.t('admin.video_call_type_internal')}
              </Radio>
              <Radio value="custom">
                {I18n.t('admin.video_call_type_custom')}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {videoCallType === 'custom' && (
            <Form.Item
              label={I18n.t('admin.meeting_link')}
              name="meetingLink"
              rules={[{ required: true },
                {
                  type: 'url',
                  pattern: /https?:\/\/(.*)/,
                  message: I18n.t('admin.scheduling_resources_invalid_url'),
                }]}
            >
              <Input name="workshop_meetinglink" />
            </Form.Item>
          )}
          <Form.Item
            label={I18n.t('admin.disable_cancellation_and_rescheduling')}
            name="disableCancellationAndRescheduling"
            rules={[{ required: true }]}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="schedulingLeadTime"
            label={I18n.t('admin.scheduling_lead_time_label')}
            {...fieldLayout}
          >
            <InputDuration
              value={60}
              onChange={() => {}}
              placeholder={I18n.t('admin.components_input_duration_placeholder')}
            />
          </Form.Item>
          {!disableCancellationAndRescheduling && (
            <>
              <Form.Item
                name="cancellationLeadTime"
                label={I18n.t('admin.cancellation_lead_time_label')}
                {...fieldLayout}
              >
                <InputDuration
                  value={60}
                  onChange={() => {}}
                  placeholder={I18n.t('admin.components_input_duration_placeholder')}
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="workshopManagersIds"
            label={<Text className="font-normal">{I18n.t('admin.scheduling_info_managers')}</Text>}
          >
            <UsersSelectWithTags
              userIdField="userId"
              placeholder={I18n.t('admin.scheduling_info_search_placehoder')}
              users={workshopManagers}
              preSelectedUsers={workshop.workshopManagers}
              onUserSearch={searchKey => handleSearch(searchKey, 'search_managers')}
            />
          </Form.Item>
          <Form.Item
            name="workshopAssessorsIds"
            label={<Text className="font-normal">{I18n.t('admin.scheduling_info_assessors')}</Text>}
          >
            <UsersSelectWithTags
              userIdField="userId"
              placeholder={I18n.t('admin.scheduling_info_search_placehoder')}
              users={workshopAssessors}
              preSelectedUsers={workshop.workshopAssessors}
              onUserSearch={searchKey => handleSearch(searchKey, 'search_assessors')}
            />
          </Form.Item>
          <Form.Item
            name="totalSeats"
            label={<Text className="font-normal">{I18n.t('admin.scheduling_info_total_seats')}</Text>}
          >
            <InputNumber />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
