import {
  Button, Modal, Space, Tag, Typography, message,
} from 'antd'
import { useParams } from 'react-router-dom'

import {
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { ConnectedProps, connect } from 'react-redux'
import {
  WorkshopInvitedSubjectTR, WorkshopInvitedSubject,
} from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar } from '~/glint'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { SubjectAddFormModal } from './SubjectAddFormModal'

const { I18n } = window
const { Text } = Typography

const STATUSES_TO_COLOR = {
  pending: 'default',
  accepted: 'success',
  cancelled: 'error',
  requested_cancellation: 'warning',
  requested_cancellation_rejected: 'error',
  requested_rescheduling: 'warning',
  requested_rescheduling_rejected: 'error',
  rescheduled: 'success',
}

const connector = connect(null, { openModal })
type Props = ConnectedProps<typeof connector>

export const SubjectListComponent:React.FC<Props> = ({ openModal }) => {
  const { inviteId } = useParams<{ inviteId: string, campaignId: string }>()

  return (
    <>
      <Resource
        config={{
          basePath: `/workshop_invites/${inviteId}`,
          trackUrl: true,
          responseType: WorkshopInvitedSubjectTR,
          apiConfig: {
            include: ['user'],
            fields: { users: ['id', 'full_name', 'email', 'photo_url'] },
          },
        }}
        name="workshop_invited_subjects"
      >
        <Resource.Filter placeholder="Search" name="filterable_fields">
          <Button type="primary" onClick={() => openModal('SubjectAddFormModal')}>
            <PlusOutlined />
            {' '}
            {I18n.t('administration.invited_subject.add_btn')}
          </Button>
        </Resource.Filter>
        <Resource.Table pagination>
          <Resource.Column
            title={I18n.t('common.column.id')}
            id="id"
            width="10%"
            sorter
          />
          <Resource.Column<WorkshopInvitedSubject>
            title={I18n.t('administration.invited_subject.column.participant')}
            id="user.firstName"
            sorter
            width="60%"
            render={(_, { user }) => (
              <Space>
                <ResourceAvatar
                  key={user.id}
                  tooltip={user.fullName}
                  url={user.photoUrl}
                  name={user.fullName}
                />
                <Space size={0} direction="vertical">
                  <Text>{user?.fullName}</Text>
                  <Text type="secondary" className="fs-12">{user?.email}</Text>
                </Space>
              </Space>
            )}
          />
          <Resource.Column<WorkshopInvitedSubject>
            id="status"
            title={I18n.t('common.column.status')}
            sorter
            render={(_, { status }) => (
              <Tag color={STATUSES_TO_COLOR[status]}>{I18n.t(`administration.invited_subject.statuses.${status}`)}</Tag>
            )}
          />
          <Resource.Column<WorkshopInvitedSubject>
            id="remove"
            title={I18n.t('common.actions.remove')}
            render={(_, workshopInvitedSubject) => <RemoveSubject workshopInvitedSubject={workshopInvitedSubject} />}
          />
        </Resource.Table>
        <Modals modals={{ SubjectAddFormModal }} />
      </Resource>
    </>
  )
}

const RemoveSubject: React.FC<{ workshopInvitedSubject: WorkshopInvitedSubject }> = ({ workshopInvitedSubject }) => {
  const { resource } = useResourceContext<WorkshopInvitedSubject>()

  const removeSubject = ({ id, user }: WorkshopInvitedSubject) => {
    Modal.confirm({
      title: I18n.t('administration.invited_subject.remove_confirm.title'),
      content: I18n.t('administration.invited_subject.remove_confirm.content', { subjectEmail: user.email }),
      okText: I18n.t('common.text.confirm'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        resource.removeResource(id).then(() => {
          message.success(I18n.t('administration.invited_subject.remove_confirm.success',
            { subjectEmail: user.email }))
        })
      },
    })
  }

  return <CloseOutlined onClick={() => removeSubject(workshopInvitedSubject)} />
}

export const SubjectList = connector(SubjectListComponent)
