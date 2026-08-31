import React, { ReactNode, useState } from 'react'
import {
  Button, MenuProps, Space, Switch, Tag, Typography, Checkbox, App,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { ModalStaticFunctions } from 'antd/es/modal/confirm'
import { MessageInstance } from 'antd/es/message/interface'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import {
  WorkshopSubject, WorkshopSubjectTR,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ResourceAvatar } from '~/glint'
import { BulkSchedule } from '../BulkSchedule/BulkSchedule'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import { EditSubjectDrawer } from './EditSubjectDrawer'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { SafeHTML } from '~/components/SafeHTML'
import { AddSubjectForm } from './AddSubjectForm'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { baseErrorMessage } from '~/hooks/useResources/utils'

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
const RE_ENROLL_SCHEDULING_STATUSES = ['cancelled', 'late_cancelled']

interface OwnProps {
  workshop: Workshop
}

interface SubjectTableProps {
  workshop: Workshop
  handleEditSubject: (id: string, userId: string, campaignAssessmentGroupId: string) => void
  currentUser: { id: string, role: string }
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & OwnProps & { toggle?: ReactNode }

export const SubjectListComponent: React.FC<Props> = ({ workshop, currentUser, toggle }) => {
  const { id, campaignId } = useParams() as { id: string, campaignId: string }
  const [openEditDrawer, setOpenEditDrawer] = useState(false)
  const [currentSubjectId, setCurrentSubjectId] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentCampaignAssessmentGroupId, setCurrentCampaignAssessmentGroupId] = useState('')

  const handleEditSubject = (id, userId, campaignAssessmentGroupId) => {
    setCurrentSubjectId(id)
    setCurrentUserId(userId)
    setCurrentCampaignAssessmentGroupId(campaignAssessmentGroupId)
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
      <Resource
        title={I18n.t('admin.scheduling_tabs_assessment_center')}
        config={config}
        name="workshop_subjects"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingAssessmentCenterParticipants}
      >
        <SubjectsTable
          workshop={workshop}
          handleEditSubject={handleEditSubject}
          currentUser={currentUser}
          toggle={toggle}
        />
      </Resource>
      <EditSubjectDrawer
        workshopStartTime={workshop.startTime}
        subjectId={currentSubjectId}
        userId={currentUserId}
        campaignAssessmentGroupId={currentCampaignAssessmentGroupId}
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

const SubjectsTable: React.FC<SubjectTableProps & { toggle?: ReactNode }> = ({
  workshop, handleEditSubject, currentUser, toggle,
}) => {
  const { resource } = useResourceContext<WorkshopSubject>()
  const { campaignId } = useParams() as { campaignId: string }
  const [openForm, setOpenForm] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<WorkshopSubject[]>([])
  const { memberAction } = useResources('workshops', { basePath: `campaigns/${campaignId}/` })
  const [openSubjectForm, setOpenSubjectForm] = useState(false)
  const { message, modal } = App.useApp()

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
      <Resource.Filter
        name="user_full_name_or_user_email_cont"
        controls={toggle}
      >
        {resource.meta.permissions?.manage && (
          <Button
            disabled={!selectedSubjects.length}
            type="primary"
            onClick={() => setOpenForm(true)}
          >
            {I18n.t('admin.scheduling_schedule_assessments')}
          </Button>
        )}
        <Button
          disabled={!resource.meta.permissions?.create}
          type="primary"
          onClick={() => setOpenSubjectForm(true)}
        >
          <PlusOutlined />
          {I18n.t('admin.scheduling_add_subject')}
        </Button>

      </Resource.Filter>
      <Resource.Table embedded pagination>
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
              {I18n.t('shared.id')}
            </Space>
          )}
          id="id"
          width={100}
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
          fixed="left"
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('admin.scheduling_columns_participants')}
          id="full_name"
          hideable={false}
          width="40%"
          render={({ user, id, campaignAssessmentGroupId }, record) => {
            const { fullName, photoUrl } = user || {}
            const userId = user?.id
            return (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => (
                  resource.meta.permissions?.manage && !UNACTIONABLE_SCHEDULING_STATUSES.includes(
                    record.schedulingStatus,
                  ) && handleEditSubject(id, userId, campaignAssessmentGroupId)
                )}
              >
                <Space>
                  <ResourceAvatar size="large" key={id} tooltip={fullName} url={photoUrl} name={fullName} />
                  <Space size={0} orientation="vertical">
                    {user?.fullName}
                    <Text type="secondary" className="fs-12">{user?.email}</Text>
                  </Space>
                </Space>
              </div>
            )
          }}
          fixed="left"
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('admin.scheduling_columns_prework')}
          id="preworks"
          minWidth={100}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('admin.scheduling_columns_activity')}
          id="workshopActivities"
          minWidth={100}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('admin.scheduling_columns_attendance')}
          id="attended"
          render={subject => <ActiveSwitch subject={subject} />}
          minWidth={100}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('admin.scheduling_attendance_status_column_name')}
          id="attendanceStatus"
          render={(_, { attendanceStatus }) => (
            <Tag color={ATTENDANCE_TAG_COLORS[attendanceStatus]}>
              {I18n.t(`admin.scheduling_attendance_status_${attendanceStatus}`)}
            </Tag>
          )}
          minWidth={150}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('admin.scheduling_columns_scheduling_status')}
          id="scheduling_status"
          render={(_, { schedulingStatus }) => (
            <Tag color={SCHEDULING_STATUS_TO_TAG_COLOR[schedulingStatus]}>
              {I18n.t(`admin.scheduling_scheduling_statuses_${schedulingStatus}`)}
            </Tag>
          )}
          minWidth={150}
        />
        <Resource.Column<WorkshopSubject>
          title={I18n.t('shared.action')}
          id="actions"
          hideable={false}
          key="actions"
          render={subject => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  subject,
                  currentUser,
                  modal,
                  message,
                })
              }
            />
          )}
          width={100}
          fixed="right"
        />
      </Resource.Table>
      {openForm && (
        <BulkSchedule
          open={openForm}
          subjects={selectedSubjects}
          onClose={() => setOpenForm(false)}
          onSave={updateSubjects}
          workshopStartTime={workshop.startTime}
          campaignAssessmentGroupId={workshop.campaignAssessmentGroupId}
        />
      )}
      {openSubjectForm && (<AddSubjectForm close={() => setOpenSubjectForm(false)} />)}
    </>
  )
}

interface ActionMenuData {
  subject: WorkshopSubject
  currentUser: SubjectTableProps['currentUser']
  modal: Omit<ModalStaticFunctions, 'warn'>
  message: MessageInstance
}

const getActionsMenuProps = ({
  subject, currentUser, modal, message,
}:ActionMenuData):MenuProps => {
  const { resource } = useResourceContext<WorkshopSubject, BaseMeta & { permission: { remove: boolean } }>()
  const handleMarkCancel = () => {
    modal.confirm({
      title: I18n.t('admin.scheduling_subjects_confirm_title'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      width: 650,
      content: (
        <SafeHTML
          html={
            I18n.t('admin.scheduling_subjects_confirm_message', { subject_email: subject?.user?.email })
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
            I18n.t('admin.scheduling_subjects_mark_cancel_success', { subject_email: subject?.user?.email }),
          )
        }).catch(() => {
          message.error(I18n.t('common.errors.something_wrong'))
        })
      },
    })
  }

  const handleReEnroll = () => {
    modal.confirm({
      title: I18n.t('admin.scheduling_subjects_confirm_title'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      width: 650,
      content: (
        <SafeHTML
          html={
            I18n.t('admin.scheduling_subjects_re_enroll_confirm_message',
              { subject_email: subject?.user?.email })
          }
        />
      ),
      onOk: () => {
        resource.memberAction({
          id: subject.id,
          action: 're_enroll',
          method: 'post',
          body: { subjectId: subject.id },
          updateStore: true,
        }).then(() => {
          message.success(
            I18n.t('admin.scheduling_subjects_re_enroll_success', { subject_email: subject?.user?.email }),
          )
        }).catch((errors) => {
          message.error(baseErrorMessage(errors) || I18n.t('common.errors.something_wrong'))
        })
      },
    })
  }

  const menuItems:MenuItem[] = []

  resource.meta.permissions?.manage && !UNACTIONABLE_SCHEDULING_STATUSES.includes(
    subject.schedulingStatus,
  ) && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button type="link" onClick={handleMarkCancel} className="ps-0">
          {I18n.t('admin.scheduling_subjects_mark_cancel')}
        </Button>
      </>
    ),
  })
  resource.meta.permissions?.manage && RE_ENROLL_SCHEDULING_STATUSES.includes(
    subject.schedulingStatus,
  ) && menuItems.push({
    key: 'reEnroll',
    label: (
      <>
        <Button type="link" onClick={handleReEnroll} className="ps-0">
          {I18n.t('admin.scheduling_subjects_re_enroll')}
        </Button>
      </>
    ),
  })
  isSuperAdmin(currentUser) && menuItems.push({
    key: 'loginAs',
    label: (
      <Button
        type="link"
        href={`/administration/users/${subject.user?.id}/spoof`}
        rel="noopener noreferrer"
        target="_blank"
        className="ps-0 color-primary"
      >
        {I18n.t('admin.login')}
      </Button>
    ),
  })

  return ({ items: menuItems })
}

export const SubjectList = connecter(SubjectListComponent)
