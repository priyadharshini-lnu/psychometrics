import _ from 'lodash'
import { FC, useState, useEffect } from 'react'
import {
  Form, Typography, InputNumber, Input, Radio, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
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

export const WorkshopEditFormModal: FC<Props> = ({
  close,
  workshop,
  updateWorkshop,
}) => {
  const [form] = Form.useForm()
  const [workshopManagers, setWorkshopManagers] = useState<UserDetails[]>([])
  const [workshopAssessors, setWorkshopAssessors] = useState<UserDetails[]>([])
  const { campaignId } = useParams<{ campaignId: string }>()
  const { projectId } = useParams<{ projectId: string }>()

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
        endDateTime: dayjs.tz(
          workshop.startTime, workshop.timezone,
        ).add(workshop.duration, 's').format(),
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
            <Input />
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
              <Input />
            </Form.Item>
          )}
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
