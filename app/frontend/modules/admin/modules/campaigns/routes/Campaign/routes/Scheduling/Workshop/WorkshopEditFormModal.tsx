import _ from 'lodash'
import { FC, useState, useEffect } from 'react'
import {
  Form, Typography, InputNumber, Input, Radio, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { durationValidator } from './utils'
import InputDuration from '~/components/InputDuration'
import dayjs from '~/utils/dayjs'
import ResourceFormModal from '~/components/ResourceFormModal'
import {
  UserDetails, userDetailsListTR, Workshop,
} from '~/modules/admin/modules/campaigns/core/workshop'
import { UsersSelectWithTags } from '~/glint'
import { useResources } from '~/hooks/useResources'

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

export const WorkshopEditFormModal: FC<Props> = ({
  close,
  workshop,
  updateWorkshop,
}) => {
  const [form] = Form.useForm()
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

  const [videoCallType, setVideoCallType] = useState<string>(workshop.videoCallType)

  useEffect(() => {
    form.setFieldValue('workshopManagersIds', _.map(workshop.workshopManagers, 'userId').map(id => id?.toString()))
    form.setFieldValue('workshopAssessorsIds', _.map(workshop.workshopAssessors, 'userId').map(id => id?.toString()))
  }, [])

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
      request={{
        updateResource: (data: {workshopManagersIds: string[], workshopAssessorsIds: string[]}) => updateWorkshop({
          ...data,
          workshopManagersIds: (data.workshopManagersIds || []).map(id => id.toString()),
          workshopAssessorsIds: (data.workshopAssessorsIds || []).map(id => id.toString()),
        }),
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.scheduling.assessment_center_form.name_label')}
            rules={[{ required: true }]}
          >
            <Input name="workshop_name" />
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.scheduling.assessment_center_form.allow_late_cancellation_and_rescheduling')}
            name="allowLateCancellationAndRescheduling"
            rules={[{ required: true }]}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.scheduling.assessment_center_form.video_call_type_label')}
            name="videoCallType"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={(e) => { setVideoCallType(e.target.value) }}>
              <Radio value="not_available">
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.none')}
              </Radio>
              <Radio value="internal">
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.internal')}
              </Radio>
              <Radio value="custom">
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.custom')}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {videoCallType === 'custom' && (
            <Form.Item
              label="Meeting Link"
              name="meetingLink"
              rules={[{ required: true },
                { type: 'url', message: I18n.t('administration.scheduling.errors.invalid_url') },
                {
                  pattern: /^https:\/\/(.*)/,
                  message: I18n.t('administration.scheduling.errors.meeting_link_https'),
                }]}
            >
              <Input name="workshop_meetinglink" />
            </Form.Item>
          )}
          <Form.Item
            name="schedulingLeadTime"
            label={I18n.t('administration.scheduling.assessment_center_form.scheduling_lead_time_label')}
            {...fieldLayout}
            rules={[
              {
                validator: durationValidator({
                  minMinutes: 1,
                  maxMinutes: 24 * 60 * 30, // 30 days
                  // eslint-disable-next-line max-len
                  minError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_min_error'),
                  // eslint-disable-next-line max-len
                  maxError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_max_error'),
                  requiredError: I18n.t('administration.scheduling.assessment_center_form.required_error'),
                }),
              },
            ]}
          >
            <InputDuration
              value={60}
              onChange={() => {}}
              placeholder={I18n.t('administration.components.input_duration.placeholder')}
            />
          </Form.Item>
          <Form.Item
            name="cancellationLeadTime"
            label={I18n.t('administration.scheduling.assessment_center_form.cancellation_lead_time_label')}
            {...fieldLayout}
            rules={[
              {
                validator: durationValidator({
                  minMinutes: 1,
                  maxMinutes: 24 * 60 * 30,
                  // eslint-disable-next-line max-len
                  minError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_min_error'),
                  // eslint-disable-next-line max-len
                  maxError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_max_error'),
                  requiredError: I18n.t('administration.scheduling.assessment_center_form.required_error'),
                }),
              },
            ]}
          >
            <InputDuration
              value={60}
              onChange={() => {}}
              placeholder={I18n.t('administration.components.input_duration.placeholder')}
            />
          </Form.Item>
          <Form.Item
            name="workshopManagersIds"
            label={<Text className="font-normal">{I18n.t('administration.scheduling.info.managers')}</Text>}
          >
            <UsersSelectWithTags
              userIdField="userId"
              placeholder={I18n.t('administration.scheduling.info.search_placehoder')}
              users={workshopManagers}
              preSelectedUsers={workshop.workshopManagers}
              onUserSearch={searchKey => handleSearch(searchKey, 'search_managers')}
            />
          </Form.Item>
          <Form.Item
            name="workshopAssessorsIds"
            label={<Text className="font-normal">{I18n.t('administration.scheduling.info.assessors')}</Text>}
          >
            <UsersSelectWithTags
              userIdField="userId"
              placeholder={I18n.t('administration.scheduling.info.search_placehoder')}
              users={workshopAssessors}
              preSelectedUsers={workshop.workshopAssessors}
              onUserSearch={searchKey => handleSearch(searchKey, 'search_assessors')}
            />
          </Form.Item>
          <Form.Item
            name="totalSeats"
            label={<Text className="font-normal">{I18n.t('administration.scheduling.info.total_seats')}</Text>}
          >
            <InputNumber />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
