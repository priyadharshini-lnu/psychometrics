import _ from 'lodash'
import { FC, useState, useEffect } from 'react'
import {
  Form, Typography, InputNumber,
} from 'antd'
import moment from 'moment-timezone'
import { useParams } from 'react-router-dom'
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
        endDateTime: moment.tz(
          workshop.startTime, workshop.timezone,
        ).add(workshop.duration, 's').format(moment.defaultFormat),
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
        updateResource: (data: {workshopManagers: string[], workshopAssessors: string[]}) => updateWorkshop({
          ...data,
          workshopManagers: data.workshopManagers.map(id => id.toString()),
          workshopAssessors: data.workshopAssessors.map(id => id.toString()),
        }),
      }}
    >
      {() => (
        <>
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
