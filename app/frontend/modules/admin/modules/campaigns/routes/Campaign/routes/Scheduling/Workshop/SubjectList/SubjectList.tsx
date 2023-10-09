import React, { useState } from 'react'
import {
  Button, Menu, Space, Switch, Tag, message, Typography, Checkbox, Modal,
} from 'antd'
import { useParams } from 'react-router-dom'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { PlusOutlined } from '@ant-design/icons'
import { useResources } from '~/hooks/useResources'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import {
  WorkshopSubject, WorkshopSubjectTR,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar } from '~/glint'
import { BulkSchedule } from '../BulkSchedule/BulkSchedule'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import { EditSubjectDrawer } from './EditSubjectDrawer'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { SafeHTML } from '~/components/SafeHTML'
import { AddSubjectForm } from './AddSubjectForm'

const { I18n } = window
const { Text } = Typography

const ATTENDANCE_TAG_COLORS = {
  no_status: 'default',
  on_time: 'success',
  late: 'warning',
  no_show: 'error',
  dropped_out: 'warning',
}
const SCHEDULING_STATUS_TO_TAG_COLOR = {
  scheduled: 'success',
  rescheduled: 'error',
  cancelled: 'error',
  late_scheduled: 'error',
  late_rescheduled: 'error',
}
const UNACTIONABLE_SCHEDULING_STATUSES = ['rescheduled', 'cancelled', 'late_rescheduled', 'late_cancelled']
const CANCELLED_SCHEDULING_STATUSES = ['cancelled', 'late_cancelled']

interface Props {
  workshop: Workshop
}

interface SubjectTableProps {
  workshop: Workshop
  handleEditSubject: (id: string, userId: string) => void
}

export const SubjectList: React.FC<Props> = ({ workshop }) => {
  const { id, campaignId } = useParams<{ id: string, campaignId: string }>()
  const [openEditDrawer, setOpenEditDrawer] = useState(false)
  const [currentSubjectId, setCurrentSubjectId] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  const handleEditSubject = (id, userId) => {
    setCurrentSubjectId(id)
    setCurrentUserId(userId)
    setOpenEditDrawer(true)
  }

  const config = {
    responseType: WorkshopSubjectTR,
    basePath: `campaigns/${campaignId}/workshops/${id}/`,
    apiConfig: {
      include: ['user', 'workshop'],
      include_meta: ['permissions'],
      fields: {
        users: ['id', 'full_name', 'email'],
        workshops: ['id'],
      },
    },
  }

  return (
    <>
      <Resource config={config} name="workshop_subjects">
        <SubjectsTable workshop={workshop} handleEditSubject={handleEditSubject} />
      </Resource>
      <EditSubjectDrawer
        subjectId={currentSubjectId}
        userId={currentUserId}
        onClose={() => setOpenEditDrawer(false)}
        open={openEditDrawer}
      />
    </>
  )
}

const ActiveSwitch: React.FC<{ subject: WorkshopSubject }> = ({ subject }) => {
  const { resource } = useResourceContext<WorkshopSubject>()

  return (
    <Switch
      disabled={!resource.meta.permissions?.manage}
      checked={subject.attended}
      onChange={() => {
        resource.updateResource({ id: subject.id, attended: !subject.attended })
      }}
    />
  )
}

const SubjectsTable: React.FC<SubjectTableProps> = ({ workshop, handleEditSubject }) => {
  const { resource } = useResourceContext<WorkshopSubject>()
  const { campaignId } = useParams<{ campaignId: string }>()
  const [openForm, setOpenForm] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<WorkshopSubject[]>([])
  const { memberAction } = useResources('workshops', { basePath: `campaigns/${campaignId}/` })
  const [openSubjectForm, setOpenSubjectForm] = useState(false)

  const toggleSelectedSubject = (checked, subject) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subject])
    } else {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject))
    }
  }

  const updateSubjects = (data) => {
    memberAction({
      id: workshop.id,
      action: 'bulk_update_subjects',
      method: 'post',
      body: data,
    }).then(() => {
      setOpenForm(false)
    })
  }

  return (
    <>
      <Resource.Filter name="user_full_name_or_user_email_cont">
        {resource.meta.permissions?.manage && (
          <Button
            disabled={!selectedSubjects.length}
            type="primary"
            onClick={() => setOpenForm(true)}
          >
            {I18n.t('administration.scheduling.schedule_assessments')}
          </Button>
        )}
        <Button
          disabled={!resource.meta.permissions?.create}
          type="primary"
          onClick={() => setOpenSubjectForm(true)}
        >
          <PlusOutlined />
          {I18n.t('administration.scheduling.add_subject')}
        </Button>

      </Resource.Filter>
      <Resource.Table pagination>
        <Resource.Column
          title={() => (
            <Space>
              {resource.meta.permissions?.manage && (
                <Checkbox
                  onChange={e => (
                    setSelectedSubjects(
                      e.target.checked
                        ? resource.data.filter(r => !UNACTIONABLE_SCHEDULING_STATUSES.includes(r.schedulingStatus))
                        : [],
                    )
                  )}
                />
              )}
              {I18n.t('administration.scheduling.id')}
            </Space>
          )}
          id="id"
          width="3%"
          render={subject => (
            <Space>
              {!UNACTIONABLE_SCHEDULING_STATUSES.includes(subject.schedulingStatus)
                && resource.meta.permissions?.manage && (
                <Checkbox
                  checked={selectedSubjects.includes(subject)}
                  onChange={e => toggleSelectedSubject(e.target.checked, subject)}
                />
              )}
              {subject.id}
            </Space>
          )}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.columns.participants')}
          id="full_name"
          width="40%"
          render={({ user, id }, record) => {
            const { fullName, photoUrl } = user || {}
            const userId = user?.id
            return (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => (
                  resource.meta.permissions?.manage && !UNACTIONABLE_SCHEDULING_STATUSES.includes(
                    record.schedulingStatus,
                  ) && handleEditSubject(id, userId)
                )}
              >
                <Space>
                  <ResourceAvatar size="large" key={id} tooltip={fullName} url={photoUrl} name={fullName} />
                  <Space size={0} direction="vertical">
                    {user?.fullName}
                    <Text type="secondary" className="fs-12">{user?.email}</Text>
                  </Space>
                </Space>
              </div>
            )
          }}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.columns.prework')}
          id="preworks"
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.columns.activity')}
          id="workshopActivities"
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.columns.attendance')}
          id="attended"
          render={subject => <ActiveSwitch subject={subject} />}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.attendance_status.column_name')}
          id="attendanceStatus"
          render={(_, { attendanceStatus }) => (
            <Tag color={ATTENDANCE_TAG_COLORS[attendanceStatus]}>
              {I18n.t(`administration.scheduling.attendance_status.${attendanceStatus}`)}
            </Tag>
          )}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.columns.scheduling_status')}
          id="scheduling_status"
          render={(_, { schedulingStatus }) => (
            <Tag color={SCHEDULING_STATUS_TO_TAG_COLOR[schedulingStatus]}>
              {I18n.t(`administration.scheduling.scheduling_statuses.${schedulingStatus}`)}
            </Tag>
          )}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('common.column.action')}
          id="actions"
          key="actions"
          render={subject => (
            <ConditionalDropdown
              menu={
                ActionsMenu({
                  subject,
                }) as React.ReactElement
              }
            />
          )}
        />
      </Resource.Table>
      <BulkSchedule
        open={openForm}
        subjects={selectedSubjects}
        onClose={() => setOpenForm(false)}
        onSave={updateSubjects}
      />
      {openSubjectForm && (<AddSubjectForm close={() => setOpenSubjectForm(false)} />)}
    </>
  )
}

interface ActionMenuProps {
  subject: WorkshopSubject
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  subject,
}) => {
  const { resource } = useResourceContext<WorkshopSubject, BaseMeta & { permission: { remove: boolean } }>()
  const handleMarkCancel = () => {
    Modal.confirm({
      title: I18n.t('administration.scheduling.subjects.confirm_title'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      width: 650,
      content: (
        <SafeHTML
          html={
            I18n.t('administration.scheduling.subjects.confirm_message', { subject_email: subject?.user?.email })
          }
        />
      ),
      onOk: () => {
        resource.memberAction({
          id: subject.id,
          action: 'mark_cancelled',
          method: 'post',
          body: { subjectId: subject.id },
          updateStore: true,
        }).then(() => {
          message.success(
            I18n.t('administration.scheduling.subjects.mark_cancel_success', { subject_email: subject?.user?.email }),
          )
        }).catch(() => {
          message.error(I18n.t('common.errors.something_wrong'))
        })
      },
    })
  }

  const menuItems:ItemType[] = []

  resource.meta.permissions?.remove && !CANCELLED_SCHEDULING_STATUSES.includes(
    subject.schedulingStatus,
  ) && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button type="link" onClick={handleMarkCancel} className="ps-0">
          Mark Cancel
        </Button>
      </>
    ),
  })

  return (
    <Menu items={menuItems} />
  )
}
