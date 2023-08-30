import React, { useState } from 'react'
import {
  Button, Menu, Space, Switch, Tag, message, Typography, Checkbox, Modal,
} from 'antd'
import { useParams } from 'react-router-dom'
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

const { I18n } = window
const { Text } = Typography

const TAG_COLORS = {
  // attendance statuses
  no_status: 'default',
  on_time: 'success',
  late: 'warning',
  no_show: 'error',
  dropped_out: 'warning',
  // completion statuses
  not_started: 'default',
  completed: 'success',
}

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
      include: ['user'],
      include_meta: ['permissions'],
      fields: {
        users: ['id', 'full_name', 'email'],
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
  const [openForm, setOpenForm] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<WorkshopSubject[]>([])
  const { memberAction } = useResources('workshops', { })

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
      </Resource.Filter>
      <Resource.Table pagination>
        <Resource.Column
          title={() => (
            <Space>
              {resource.meta.permissions?.manage && (
                <Checkbox onChange={e => setSelectedSubjects(e.target.checked ? resource.data : [])} />
              )}
              {I18n.t('administration.scheduling.id')}
            </Space>
          )}
          id="id"
          width="3%"
          render={subject => (
            <Space>
              {resource.meta.permissions?.manage && (
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
          render={({ user, id }) => {
            const { fullName, photoUrl } = user || {}
            const userId = user?.id
            return (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => resource.meta.permissions?.manage && handleEditSubject(id, userId)}
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
            <Tag color={TAG_COLORS[attendanceStatus]}>
              {I18n.t(`administration.scheduling.attendance_status.${attendanceStatus}`)}
            </Tag>
          )}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('administration.scheduling.completion_status.column_name')}
          id="completion_status"
          render={(_, { completionStatus }) => (
            <Tag color={TAG_COLORS[completionStatus]}>
              {I18n.t(`administration.scheduling.completion_status.${completionStatus}`)}
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
  const handleOnConfirm = () => resource.removeResource(subject.id).then(() => {
    message.success(
      I18n.t('administration.scheduling.subjects.success_message', { subject_email: subject?.user?.email }),
    )
  }).catch(() => {
    message.error(I18n.t('common.errors.something_wrong'))
  })

  const handleRemove = () => {
    Modal.confirm({
      title: I18n.t('administration.scheduling.subjects.confirm_title'),
      content: I18n.t('administration.scheduling.subjects.confirm_message', { subject_email: subject?.user?.email }),
      okText: I18n.t('common.text.confirm'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: handleOnConfirm,
    })
  }


  const menuItems = [
    resource.meta.permissions?.remove ? {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={handleRemove} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
        </>
      ),
    } : null,
  ].filter(Boolean)

  return (
    <Menu items={menuItems} />
  )
}
