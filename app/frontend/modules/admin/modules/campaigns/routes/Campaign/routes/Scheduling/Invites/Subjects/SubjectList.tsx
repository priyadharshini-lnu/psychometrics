import {
  Button, Space, Tag, Typography, App, Flex,
} from 'antd'
import { Link, useParams } from 'react-router-dom'

import {
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { ConnectedProps, connect } from 'react-redux'
import React from 'react'
import {
  WorkshopInvitedSubjectTR, WorkshopInvitedSubject,
} from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar } from '~/glint'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { SubjectAddFormModal } from './SubjectAddFormModal'
import dayjs from '~/utils/dayjs'

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
  const { inviteId, campaignId, projectId } = useParams<{ inviteId: string, projectId: string, campaignId: string }>()
  const assessmentCenterPath = `/admin/projects/${projectId}/new_campaigns/${campaignId}/scheduling/assessment_center/`
  return (
    <>
      <Resource
        config={{
          basePath: `campaigns/${campaignId}/workshop_invites/${inviteId}`,
          trackUrl: true,
          responseType: WorkshopInvitedSubjectTR,
          apiConfig: {
            include: ['user'],
            include_meta: ['permissions'],
            fields: { users: ['id', 'full_name', 'email', 'photo_url'] },
          },
        }}
        name="workshop_invited_subjects"
      >
        <Filter openModal={openModal} />
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
            width="40%"
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
            title={I18n.t('common.column.details')}
            id="details"
            sorter
            render={(_, subject) => {
              const bookedAt = dayjs(subject.bookedAt)
              const assessmentCenterBooked = dayjs(subject.subjectWorkshopDateTime)
              if ((subject.status !== 'accepted'
                      && subject.status !== 'cancelled'
                      && subject.status !== 'rescheduled'
              ) || (!bookedAt && !assessmentCenterBooked)) {
                return (
                  '-'
                )
              }
              return (
                <Flex vertical gap={8}>
                  <Flex vertical>
                    <Typography.Text strong>
                      {I18n.t('administration.invited_subject.booked_at')}
                    </Typography.Text>
                    <Typography.Text>
                      {`${bookedAt.format('DD MMM, HH:mm')} ${bookedAt.format(' (z)')}`}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical>
                    <Typography.Text strong>
                      {I18n.t('administration.invited_subject.assessment_center')}
                    </Typography.Text>
                    <Typography.Text>
                      <Link
                        to={`${assessmentCenterPath}${subject.workshopId}`}
                        state={{ search: location.search }}
                      >
                        {`${assessmentCenterBooked.format('DD MMM, HH:mm')} 
                      ${assessmentCenterBooked.format(' (z)')}`}
                      </Link>
                    </Typography.Text>
                  </Flex>
                </Flex>
              )
            }}
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

const Filter: React.FC<Props> = ({ openModal }) => {
  const { resource } = useResourceContext<WorkshopInvitedSubject, { permissions: { create: boolean } }>()

  return (
    <Resource.Filter
      placeholder="Search"
      name="filterable_fields"
    >
      {resource.meta.permissions.create && (
        <Button type="primary" onClick={() => openModal('SubjectAddFormModal')}>
          <PlusOutlined />
          {' '}
          {I18n.t('administration.invited_subject.add_btn')}
        </Button>
      )}
    </Resource.Filter>
  )
}

const RemoveSubject: React.FC<{ workshopInvitedSubject: WorkshopInvitedSubject }> = ({ workshopInvitedSubject }) => {
  const { resource } = useResourceContext<WorkshopInvitedSubject>()
  const { modal, message } = App.useApp()

  const removeSubject = ({ id, user }: WorkshopInvitedSubject) => {
    modal.confirm({
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
