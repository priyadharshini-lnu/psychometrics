import React, { useState } from 'react'
import {
  Button, Space, Tag, Typography, App, Flex, Checkbox,
} from 'antd'
import { Link, useParams } from 'react-router-dom'

import { ConnectedProps, connect } from 'react-redux'
import * as t from 'io-ts'
import {
  PlusOutlined,
  CloseOutlined,
  CloudDownloadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  WorkshopInvitedSubjectTR, WorkshopInvitedSubject,
} from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ResourceAvatar } from '~/glint'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { SubjectAddFormModal } from './SubjectAddFormModal'
import { SubjectBulkImportModal } from './SubjectBulkImportModal'
import dayjs from '~/utils/dayjs'
import { ActionsDropdown } from './ActionsDropdown'
import { importCSV, IMPORT_CSV } from '~/modules/admin/modules/client/core/workshopInvitedSubject'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'

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

const connector = connect(
  (state: RootState) => ({
    importInProgress: isRequestInProgress(state, IMPORT_CSV),
  }),
  { openModal, importCSV },
)
type Props = ConnectedProps<typeof connector>

interface FilterProps {
  permissions: Permission,
  openModal: (modalName: string) => void
  handleBulkConfirmAction: (action: string) => void
  selectedWorkshopInvitedSubjects: WorkshopInvitedSubject[]
  showBulkImportModal: (show: boolean) => void
}

type Permission = {
  resendInvite?: boolean
  create?: boolean
  importSubjectsFromCsv?: boolean
}

export const SubjectListComponent:React.FC<Props> = ({ openModal, importCSV, importInProgress }) => {
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
      <Resource
        title={I18n.t('admin.individual_invite_tabs_invitation_status')}
        config={config}
        name="workshop_invited_subjects"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingInvitesInviteParticipants}
      >
        <SubjectsTable
          openModal={openModal}
          assessmentCenterPath={assessmentCenterPath}
          importCSV={importCSV}
          importInProgress={importInProgress}
        />
      </Resource>
    </>
  )
}

const SubjectsTable = ({
  openModal, assessmentCenterPath, importCSV, importInProgress,
}) => {
  const { modal, message } = App.useApp()
  const { resource } = useResourceContext<WorkshopInvitedSubject>()
  const {
    collectionAction, data, meta, fetch,
  } = resource
  const { campaignId, inviteId } = useParams() as { campaignId: string, inviteId: string }

  const [selectedWorkshopInvitedSubjects, setSelectedWorkshopInvitedSubjects] = useState<WorkshopInvitedSubject[]>([])
  const [bulkImportModal, showBulkImportModal] = useState(false)
  const [csvErrors, setCsvErrors] = useState<{ message?: string }[]>([])


  const workshopInviteSubjectIds = selectedWorkshopInvitedSubjects.map(subject => subject.id)

  const toggleSelectedSubject = (checked, subject) => {
    if (checked) {
      setSelectedWorkshopInvitedSubjects([...selectedWorkshopInvitedSubjects, subject])
    } else {
      setSelectedWorkshopInvitedSubjects(selectedWorkshopInvitedSubjects.filter(s => s !== subject))
    }
  }

  const handleBulkConfirmAction = (action) => {
    if (action === 'import_subjects') {
      showBulkImportModal(true)
      return
    }
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
        message.success(I18n.t('admin.resend_invite_success'))
      })
    }
  }

  const handleUpload = (file: File) => {
    const fd = new FormData()
    fd.append('page[size]', '300')
    fd.append('file', file)

    setCsvErrors([])

    importCSV(campaignId, inviteId, fd)
      .then(({ response }) => {
        if (response.meta && response.meta.errors && response.meta.errors.length > 0) {
          setCsvErrors(response.meta.errors)
          return
        }

        if (response.meta && response.meta.jobQueued) {
          message.success(I18n.t('admin.import_queued_success'), 8)
        }

        fetch()
        showBulkImportModal(false)
        setCsvErrors([])
      })
      .catch(() => {
        message.error(I18n.t('admin.import_error'))
      })
  }

  return (
    <>
      <Filter
        permissions={meta.permissions ?? {}}
        openModal={openModal}
        handleBulkConfirmAction={handleBulkConfirmAction}
        selectedWorkshopInvitedSubjects={selectedWorkshopInvitedSubjects}
        showBulkImportModal={showBulkImportModal}
      />
      <Resource.Table embedded pagination>
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
          fixed="left"
        />
        <Resource.Column
          title={I18n.t('common.column.id')}
          id="id"
          hideable={false}
          width="10%"
          sorter
          fixed="left"
        />
        <Resource.Column<WorkshopInvitedSubject>
          title={I18n.t('admin.column_participant')}
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
              <Space size={0} orientation="vertical">
                <Text>{user?.fullName}</Text>
                <Text type="secondary" className="fs-12">{user?.email}</Text>
              </Space>
            </Space>
          )}
        />
        <Resource.Column<WorkshopInvitedSubject>
          title={I18n.t('admin.column_scheduling_details')}
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
                    {I18n.t(`admin.statuses_${subject.schedulingStatus}`)}
                  </Tag>
                ) : (
                  '-'
                )}
                <Flex vertical gap={8}>


                  {bookedAt && (
                    <Flex vertical>
                      <Typography.Text strong>
                        {I18n.t('admin.booked_at')}
                      </Typography.Text>
                      <Typography.Text>
                        {`${bookedAt.format('DD MMM, HH:mm')} ${bookedAt.format(' (z)')}`}
                      </Typography.Text>
                    </Flex>
                  )}
                  {assessmentCenterBooked && (
                    <Flex vertical>
                      <Typography.Text strong>
                        {I18n.t('admin.assessment_center')}
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
          title={I18n.t('admin.column_invitation_status')}
          sorter
          render={(_, { status }) => (
            <Tag color={STATUSES_TO_COLOR[status]}>{I18n.t(`admin.statuses_${status}`)}</Tag>
          )}
        />
        <Resource.Column<WorkshopInvitedSubject>
          id="remove"
          hideable={false}
          title={I18n.t('shared.remove')}
          render={(_, workshopInvitedSubject) => <RemoveSubject workshopInvitedSubject={workshopInvitedSubject} />}
          fixed="right"
        />
      </Resource.Table>
      <Modals modals={{ SubjectAddFormModal }} />
      <SubjectBulkImportModal
        open={bulkImportModal}
        onCancel={() => {
          showBulkImportModal(false)
          setCsvErrors([])
        }}
        onUpload={handleUpload}
        importInProgress={importInProgress}
        csvErrors={csvErrors}
      />
    </>
  )
}


const Filter: React.FC<FilterProps> = ({
  permissions,
  openModal,
  handleBulkConfirmAction,
  selectedWorkshopInvitedSubjects,
  showBulkImportModal,
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
    {(permissions.importSubjectsFromCsv) && (
      <Button onClick={() => showBulkImportModal(true)}>
        <CloudDownloadOutlined />
        {' '}
        {I18n.t('admin.import_users')}
      </Button>
    )}
    {permissions.create && (
      <Button type="primary" onClick={() => openModal('SubjectAddFormModal')}>
        <PlusOutlined />
        {' '}
        {I18n.t('admin.add_btn')}
      </Button>
    )}
  </Resource.Filter>
)

const RemoveSubject: React.FC<{ workshopInvitedSubject: WorkshopInvitedSubject }> = ({ workshopInvitedSubject }) => {
  const { resource } = useResourceContext<WorkshopInvitedSubject>()
  const { modal, message } = App.useApp()

  const removeSubject = ({ id, user }: WorkshopInvitedSubject) => {
    modal.confirm({
      title: I18n.t('admin.remove_confirm_title'),
      content: I18n.t('admin.remove_confirm_content', { subjectEmail: user.email }),
      okText: I18n.t('shared.confirm'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        resource.removeResource(id).then(() => {
          message.success(I18n.t('admin.remove_confirm_success',
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
      title: I18n.t('admin.resend_invite_title'),
      content: I18n.t('admin.resend_invite_content'),
    }
  }
  return {}
}

export const SubjectList = connector(SubjectListComponent)
