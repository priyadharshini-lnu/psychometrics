import { useParams } from 'react-router-dom'
import {
  Button, Descriptions, App, Space, Tag, Typography,
} from 'antd'
import {
  WorkshopInvitedSubject, WorkshopInvitedSubjectTR,
} from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar, DateTimeWithZone } from '~/glint'
import { formatWorkshopDate } from '~/utils/workshop'

const { I18n } = window
const { Text } = Typography

const STATUSES_TO_COLOR = {
  requested_cancellation: 'warning',
  requested_cancellation_rejected: 'error',
  requested_rescheduling: 'warning',
  requested_rescheduling_rejected: 'error',
}

export const RequestsTable = () => {
  const { campaignId } = useParams() as { campaignId: string }

  const config = {
    responseType: WorkshopInvitedSubjectTR,
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      filter: {
        status_in: [
          'requested_cancellation',
          'requested_cancellation_rejected',
          'requested_rescheduling',
          'requested_rescheduling_rejected',
        ],
      },
      include: ['user', 'workshops'],
      include_meta: ['permissions'],
      fields: {
        users: ['id', 'full_name', 'email', 'photo_url'],
        workshops: ['id', 'start_time'],
      },
    },
  }

  return (
    <Resource config={config} name="workshop_invited_subjects">
      <br />
      <Resource.Table pagination>
        <Resource.Column<WorkshopInvitedSubject>
          title={I18n.t('admin.invite_request_subject_name')}
          id="user.firstName"
          sorter
          render={(_, { user }) => (
            <Space>
              <ResourceAvatar
                key={user.id}
                tooltip={user.fullName}
                url={user.photoUrl}
                name={user.fullName}
              />
              <Space size={0} orientation="vertical">
                <Text>{user?.fullName}</Text>
                <Text type="secondary" className="fs-12">{user?.email}</Text>
              </Space>
            </Space>
          )}
        />
        <Resource.Column<WorkshopInvitedSubject>
          title={I18n.t('shared.status')}
          id="status"
          sorter
          render={(_, { status }) => (
            <Tag color={STATUSES_TO_COLOR[status]}>{I18n.t(`admin.statuses_${status}`)}</Tag>
          )}
        />
        <Resource.Column<WorkshopInvitedSubject>
          title={I18n.t('admin.invite_request_workshop_time')}
          id="workshop"
          render={(data) => {
            if (data.status.includes('requested_rescheduling')) {
              return (
                <Descriptions title="" size="small" column={1} style={{ maxWidth: '350px' }}>
                  <Descriptions.Item label="From" labelStyle={{ color: 'gray' }}>
                    {formatWorkshopDate(data.subjectWorkshopDateTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="To" labelStyle={{ color: 'gray' }}>
                    <DateTimeWithZone dateString={data.bookedWorkshopDateTime} />
                  </Descriptions.Item>
                </Descriptions>
              )
            }
            return (
              <DateTimeWithZone dateString={data.subjectWorkshopDateTime} />
            )
          }}
        />
        <Resource.Column<WorkshopInvitedSubject>
          title={I18n.t('admin.invite_request_reason')}
          id="reason"
        />
        <Resource.Column<WorkshopInvitedSubject>
          id="action"
          title={I18n.t('shared.action')}
          render={(_, workshopInvitedSubject) => <ActionButtons workshopInvitedSubject={workshopInvitedSubject} />}
          width={100}
        />
      </Resource.Table>
    </Resource>
  )
}

const ActionButtons: React.FC<{ workshopInvitedSubject: WorkshopInvitedSubject }> = ({
  workshopInvitedSubject,
}) => {
  const { resource } = useResourceContext<WorkshopInvitedSubject>()
  const { modal, message } = App.useApp()

  const rejectInvitedSubject = ({ id, user: { fullName }, status }: WorkshopInvitedSubject) => {
    modal.confirm({
      title: I18n.t(
        'admin.invite_request_remove_confirm_title',
        {
          action: 'Reject',
          status: I18n.t(`admin.statuses_${status}`),
        },
      ),
      content: I18n.t(
        'admin.invite_request_remove_confirm_content',
        {
          action: 'reject',
          status: I18n.t(`admin.statuses_${status}`),
          subjectName: fullName,
        },
      ),
      onOk: () => {
        resource.memberAction({
          id,
          action: 'reject_request',
          method: 'patch',
          updateStore: true,
        }).then(() => {
          resource.setData(resource.data.filter(r => r.id !== id))
          message.success(I18n.t(
            'admin.invite_request_remove_confirm_success',
            {
              status: I18n.t(`admin.statuses_${status}`),
              action: 'rejected',
              subjectName: fullName,
            },
          ))
        })
      },
    })
  }

  const acceptInvitedSubject = ({ id, user: { fullName }, status }: WorkshopInvitedSubject) => {
    modal.confirm({
      title: I18n.t(
        'admin.invite_request_remove_confirm_title',
        {
          action: 'Accept',
          status: I18n.t(`admin.statuses_${status}`),
        },
      ),
      content: I18n.t(
        'admin.invite_request_remove_confirm_content',
        {
          action: 'accept',
          status: I18n.t(`admin.statuses_${status}`),
          subjectName: fullName,
        },
      ),
      onOk: () => {
        resource.memberAction({
          id,
          action: 'accept_request',
          method: 'patch',
          updateStore: true,
        }).then(() => {
          resource.setData(resource.data.filter(r => r.id !== id))
          message.success(I18n.t(
            'admin.invite_request_remove_confirm_success',
            {
              status: I18n.t(`admin.statuses_${status}`),
              action: 'accepted',
              subjectName: fullName,
            },
          ))
        })
      },
    })
  }

  return (
    <>
      <Space>
        <Button
          type="link"
          disabled={workshopInvitedSubject.status.includes('rejected')}
          onClick={() => rejectInvitedSubject(workshopInvitedSubject)}
        >
          {I18n.t('admin.invite_request_reject')}
        </Button>
        <Button
          type="link"
          onClick={() => acceptInvitedSubject(workshopInvitedSubject)}
        >
          {I18n.t('admin.invite_request_accept')}
        </Button>
      </Space>
    </>
  )
}
