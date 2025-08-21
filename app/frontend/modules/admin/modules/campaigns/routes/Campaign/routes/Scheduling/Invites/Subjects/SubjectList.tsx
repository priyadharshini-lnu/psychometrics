import React, { useState } from 'react'
import {
  Button, Space, Tag, Typography, App, Flex, Checkbox,
} from 'antd'
import { Link, useParams } from 'react-router-dom'

import {
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { ConnectedProps, connect } from 'react-redux'
import * as t from 'io-ts'
import {
  WorkshopInvitedSubjectTR, WorkshopInvitedSubject,
} from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar } from '~/glint'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { SubjectAddFormModal } from './SubjectAddFormModal'
import dayjs from '~/utils/dayjs'
import { ActionsDropdown } from './ActionsDropdown'

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

interface FilterProps {
  permissions: Permission,
  openModal: (modalName: string) => void
  handleBulkConfirmAction: (action: string) => void
  selectedWorkshopInvitedSubjects: WorkshopInvitedSubject[]
}

type Permission = {
  resendInvite?: boolean
  create?: boolean
}

export const SubjectListComponent:React.FC<Props> = ({ openModal }) => {
  const { inviteId, campaignId, projectId } = useParams<{ inviteId: string, projectId: string, campaignId: string }>()
  const assessmentCenterPath = `/admin/projects/${projectId}/new_campaigns/${campaignId}/scheduling/assessment_center/`

  const config = {
    basePath: `campaigns/${campaignId}/workshop_invites/${inviteId}`,
    trackUrl: true,
    responseType: WorkshopInvitedSubjectTR,
    apiConfig: {
      include: ['user'],
      include_meta: ['permissions'],
      fields: { users: ['id', 'full_name', 'email', 'photo_url'] },
    },
  }

  return (
    <>
      <Resource config={config} name="workshop_invited_subjects">
        <SubjectsTable openModal={openModal} assessmentCenterPath={assessmentCenterPath} />
      </Resource>
    </>
  )
}

const SubjectsTable = ({ openModal, assessmentCenterPath }) => {
  const { modal, message } = App.useApp()
  const { resource } = useResourceContext<WorkshopInvitedSubject>()
  const { collectionAction, data, meta } = resource

  const [selectedWorkshopInvitedSubjects, setSelectedWorkshopInvitedSubjects] = useState<WorkshopInvitedSubject[]>([])

  const workshopInviteSubjectIds = selectedWorkshopInvitedSubjects.map(subject => subject.id)

  const toggleSelectedSubject = (checked, subject) => {
    if (checked) {
      setSelectedWorkshopInvitedSubjects([...selectedWorkshopInvitedSubjects, subject])
    } else {
      setSelectedWorkshopInvitedSubjects(selectedWorkshopInvitedSubjects.filter(s => s !== subject))
    }
  }

  const handleBulkConfirmAction = (action) => {
    const { title, content } = bulkActionDetails(action)
    modal.confirm({
      title,
      content,
      onOk: () => handleBulkAction(action),
    })
  }

  const handleBulkAction = (action) => {
    if (action === 'resend_invite') {
      collectionAction({
        action: 'resend_invite',
        method: 'post',
        body: {
          workshop_invite_subject_ids: workshopInviteSubjectIds,
        },
        responseType: t.unknown,
      }).then(() => {
        message.success(I18n.t('administration.invited_subject.resend_invite.success'))
      })
    }
  }

  return (
    <>
      <Filter
        permissions={meta.permissions ?? {}}
        openModal={openModal}
        handleBulkConfirmAction={handleBulkConfirmAction}
        selectedWorkshopInvitedSubjects={selectedWorkshopInvitedSubjects}
      />
      <Resource.Table pagination>
        <Resource.Column
          title={() => (
            <Space>
              <Checkbox
                onChange={e => (
                  setSelectedWorkshopInvitedSubjects(
                    e.target.checked
                      ? data.filter(r => r.status !== 'accepted')
                      : [],
                  )
                )}
              />
            </Space>
          )}
          id="id"
          width="3%"
          render={subject => (
            <Space>
              <Checkbox
                checked={selectedWorkshopInvitedSubjects.includes(subject)}
                onChange={e => toggleSelectedSubject(e.target.checked, subject)}
              />
            </Space>
          )}
        />
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
          title={I18n.t('administration.invited_subject.column.scheduling_details')}
          id="details"
          sorter
          render={(_, subject) => {
            const bookedAt = subject.bookedAt ? dayjs(subject.bookedAt) : null
            const assessmentCenterBooked = subject.subjectWorkshopDateTime
              ? dayjs(subject.subjectWorkshopDateTime)
              : null

            return (
              <>
                {subject.schedulingStatus !== null ? (
                  <Tag color={STATUSES_TO_COLOR[subject.schedulingStatus]}>
                    {I18n.t(`administration.invited_subject.statuses.${subject.schedulingStatus}`)}
                  </Tag>
                ) : (
                  '-'
                )}
                <Flex vertical gap={8}>


                  {bookedAt && (
                    <Flex vertical>
                      <Typography.Text strong>
                        {I18n.t('administration.invited_subject.booked_at')}
                      </Typography.Text>
                      <Typography.Text>
                        {`${bookedAt.format('DD MMM, HH:mm')} ${bookedAt.format(' (z)')}`}
                      </Typography.Text>
                    </Flex>
                  )}
                  {assessmentCenterBooked && (
                    <Flex vertical>
                      <Typography.Text strong>
                        {I18n.t('administration.invited_subject.assessment_center')}
                      </Typography.Text>
                      <Typography.Text>
                        <Link
                          to={`${assessmentCenterPath}${subject.workshopId}`}
                          state={{ search: location.search }}
                        >
                          {
                          `${assessmentCenterBooked.format('DD MMM, HH:mm')} ${assessmentCenterBooked.format(' (z)')}`
                          }
                        </Link>
                      </Typography.Text>
                    </Flex>
                  )}
                </Flex>
              </>
            )
          }}
        />
        <Resource.Column<WorkshopInvitedSubject>
          id="status"
          title={I18n.t('administration.invited_subject.column.invitation_status')}
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
    </>
  )
}


const Filter: React.FC<FilterProps> = ({
  permissions,
  openModal,
  handleBulkConfirmAction,
  selectedWorkshopInvitedSubjects,
}) => (
  <Resource.Filter
    placeholder="Search"
    name="filterable_fields"
  >
    <ActionsDropdown
      isBulk
      onClick={action => handleBulkConfirmAction(action)}
      permissions={permissions}
      isDisabled={selectedWorkshopInvitedSubjects.length === 0}
    />
    {permissions.create && (
      <Button type="primary" onClick={() => openModal('SubjectAddFormModal')}>
        <PlusOutlined />
        {' '}
        {I18n.t('administration.invited_subject.add_btn')}
      </Button>
    )}
  </Resource.Filter>
)

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

const bulkActionDetails = (action: string) => {
  if (action === 'resend_invite') {
    return {
      title: I18n.t('administration.invited_subject.resend_invite.title'),
      content: I18n.t('administration.invited_subject.resend_invite.content'),
    }
  }
  return {}
}

export const SubjectList = connector(SubjectListComponent)
