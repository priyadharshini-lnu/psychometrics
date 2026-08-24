import React, { ReactNode, useState } from 'react'
import {
  Button,
  Col,
  Row,
  Tag,
  Space,
  message,
} from 'antd'
import { useParams } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ConnectedProps, connect } from 'react-redux'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import {
  WorkshopUserAcitivity, WorkshopUserAcitivityTR,
} from '~/modules/admin/modules/campaigns/core/workshopActivity'
import Form from '~/modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Assessors/AssessorFormModal'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { get as getCurrentUser } from '~/core/currentUser'
import { ResourceAvatar } from '~/glint'
import styles from './styles.less'


const { I18n } = window

interface Resource {
  id: string
  fullName: string
  photoUrl: string | null
}

interface ResourceProps {
  resource: Resource
}

const ResourcesTag: React.FC<ResourceProps> = ({ resource }) => (
  <ResourceAvatar
    key={resource?.id}
    tooltip={resource?.fullName}
    url={resource?.photoUrl}
    name={resource?.fullName || ''}
  />
)

const statusToColor = {
  not_started: 'gray',
  completed: 'green',
  late: 'orange',
  dropped_out: 'orange',
  no_show: 'red',
}

const connector = connect(state => ({
  currentUser: getCurrentUser(state),
}), {})

type PropsFromRedux = ConnectedProps<typeof connector>

export const ActivitiesComponent: React.FC<PropsFromRedux & { toggle?: ReactNode }> = ({ currentUser, toggle }) => {
  const { id, campaignId, projectId } = useParams() as { id: string, campaignId: string, projectId: string }
  const [showForm, setShowForm] = useState(false)

  const config = {
    trackUrl: true,
    responseType: WorkshopUserAcitivityTR,
    basePath: `campaigns/${campaignId}/workshops/${id}/`,
    apiConfig: {
      include: ['evaluator', 'subject', 'assessment'],
      include_meta: ['permissions'],
      fields: {
        users: ['id', 'full_name', 'email'],
        assessments: ['name'],
      },
    },
  }

  return (
    <>
      <Resource
        title={I18n.t('admin.scheduling_tabs_assessment_center')}
        config={config}
        name="workshop_activities"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingAssessmentCenterActivities}
      >
        <Resource.Filter
          name="subject_full_name_or_subject_email_cont"
          controls={toggle}
        >
          <Controls setShowForm={setShowForm} />
        </Resource.Filter>
        <Resource.Table embedded pagination>
          <Resource.Column
            id="id"
            hideable={false}
            width="3%"
            title={I18n.t('common.column.id')}
            fixed="left"
          />
          <Resource.Column<WorkshopUserAcitivity>
            title={I18n.t('admin.scheduling_columns_subject')}
            id="full_name"
            width="40%"
            render={({ subject }) => (
              <Row gutter={[10, 0]}>
                <Col className={styles.workshopSubjectAvatar}>
                  <ResourcesTag resource={subject} />
                </Col>
                <Col>
                  <Row>
                    <Col>{subject?.fullName}</Col>
                  </Row>
                  <Row>
                    <Col className={styles.workshopSubjectEmail}>{subject?.email}</Col>
                  </Row>
                </Col>
              </Row>
            )}
            fixed="left"
          />
          <Resource.Column<WorkshopUserAcitivity>
            title={I18n.t('admin.scheduling_columns_assessor')}
            id="assessor"
            width="10%"
            render={({ subject, evaluator }) => (
              subject.id !== evaluator.id && (
                <Row gutter={[10, 0]}>
                  <Col className={styles.workshopSubjectAvatar}>
                    {evaluator && <ResourcesTag resource={evaluator} />}
                  </Col>
                </Row>
              )
            )}
          />
          <Resource.Column<WorkshopUserAcitivity>
            width="20%"
            title={I18n.t('admin.scheduling_columns_activity')}
            render={({ assessment }) => assessment?.name}
            id="activity"
          />
          <Resource.Column<WorkshopUserAcitivity>
            width="10%"
            title={I18n.t('admin.scheduling_columns_schedule_time')}
            id="scheduleTime"
            render={({ scheduleTime }) => scheduleTime && dayjs(scheduleTime).format('HH:mm')}
          />
          <Resource.Column<WorkshopUserAcitivity>
            width="30%"
            title={I18n.t('admin.scheduling_columns_meeting_link')}
            id="linkedSubjectMeetingLink"
            render={({ linkedSubjectMeetingLink }) => linkedSubjectMeetingLink && (
              <Space>
                <a href={linkedSubjectMeetingLink} target="_blank" rel="noreferrer">
                  {I18n.t('admin.scheduling_info_join_meeting')}
                </a>
                <CopyToClipboard
                  text={linkedSubjectMeetingLink}
                  onCopy={() => message.info(I18n.t('common.text.copied'))}
                >
                  <CopyOutlined />
                </CopyToClipboard>
              </Space>
            )}
          />
          <Resource.Column<WorkshopUserAcitivity>
            title={I18n.t('shared.status')}
            id="status"
            className={styles.ActivityStatus}
            render={(_, { status }) => (
              <Tag key={status} color={statusToColor[status]}>
                {I18n.t(`admin.scheduling_status_${status}`)}
              </Tag>
            )}
          />
          <Resource.Column<WorkshopUserAcitivity>
            title={I18n.t('common.column.action')}
            id="actions"
            hideable={false}
            key="actions"
            render={({ status, subject, evaluator }) => (
              (currentUser.id.toString() === evaluator.id && subject.id !== evaluator.id) && (
                <Button
                  href={`/assessors/campaigns/${campaignId}/users/${subject.id}`}
                  type="link"
                  className="ps-0"
                  target="_blank"
                >
                  {status === 'not_started' && I18n.t('common.actions.start')}
                  {status === 'in_progress' && I18n.t('common.actions.continue')}
                  {status === 'completed' && I18n.t('common.actions.view')}
                </Button>
              )
            )}
            fixed="right"
          />
        </Resource.Table>
        {showForm && (
          <Form
            projectId={projectId}
            campaignId={campaignId}
            close={() => {
              setShowForm(false)
            }}
            userSearchUrl={`/administration/workshops/${id}/users/search_subjects`}
            adminsSearchUrl={`/administration/workshops/${id}/users/search_assessors`}
          />
        )}
      </Resource>
    </>
  )
}

const Controls = ({ setShowForm }) => {
  const { resource } = useResourceContext()

  if (resource.meta?.permissions?.createAll) {
    return (
      <Button type="primary" onClick={() => setShowForm(true)}>
        {I18n.t('admin.scheduling_add_activity')}
      </Button>
    )
  }

  return null
}

export const Activities = connector(ActivitiesComponent)
