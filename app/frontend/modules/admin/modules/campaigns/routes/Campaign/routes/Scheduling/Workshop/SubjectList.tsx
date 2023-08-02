import React, { useState } from 'react'
import {
  Button, Menu, Space, Switch, Tag, message, Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import {
  WorkshopSubject, WorkshopSubjectTR,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ConfirmationModal, ResourceAvatar } from '~/glint'

const { I18n } = window
const { Text } = Typography

export const SubjectList: React.FC = () => {
  const { id, campaignId } = useParams<{ id: string, campaignId: string }>()
  const [confirmation, setConfirmation] = useState(false)

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
        <Resource.Filter name="user_full_name_or_user_email_cont" />
        <Resource.Table pagination>
          <Resource.Column<WorkshopSubject> title={I18n.t('common.column.id')} id="id" width="3%" />
          <Resource.Column<WorkshopSubject>
            title={I18n.t('administration.scheduling.columns.participants')}
            id="full_name"
            width="40%"
            render={({ user }) => (
              <Space>
                <ResourcesTag resource={user} />
                <Space direction="vertical">
                  {user?.fullName}
                  <Text type="secondary" className="fs-12">{user?.email}</Text>
                </Space>
              </Space>
            )}
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
            title={I18n.t('common.column.status')}
            id="status"
            render={(_, { status }) => (
              <Tag color={TAG_COLORS[status]}>
                {I18n.t(`administration.scheduling.status.${status}`)}
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
                    setConfirmation,
                    confirmation,
                  }) as React.ReactElement
                }
              />
            )}
          />
        </Resource.Table>
      </Resource>
    </>
  )
}

interface Resource {
  id: string
  fullName: string
  photoUrl: string | null
}

interface ResourceProps {
  resource: Resource
}

const ResourcesTag: React.FC<ResourceProps> = ({ resource }) => (
  <div className="mt-1">
    <ResourceAvatar
      key={resource.id}
      tooltip={resource.fullName}
      url={resource?.photoUrl}
      name={resource.fullName}
    />
  </div>
)

const TAG_COLORS = {
  not_started: 'default',
  completed: 'success',
  late: 'warning',
  dropped_out: 'warning',
  no_show: 'error',
}

const ActiveSwitch: React.FC<{ subject: WorkshopSubject }> = ({ subject }) => {
  const { resource } = useResourceContext<WorkshopSubject>()

  return (
    <Switch
      disabled={!resource.meta.permissions?.update}
      checked={subject.attended}
      onChange={() => {
        resource.updateResource({ id: subject.id, attended: !subject.attended })
      }}
    />
  )
}

interface ActionMenuProps {
  subject: WorkshopSubject
  setConfirmation: (confirmation: boolean) => void
  confirmation: boolean
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  subject, setConfirmation, confirmation,
}) => {
  const { resource } = useResourceContext<WorkshopSubject>()
  const handleOnConfirm = () => resource.removeResource(subject.id).then(() => {
    setConfirmation(false)
    message.success(
      I18n.t('administration.scheduling.subjects.success_message', { subject_email: subject?.user?.email }),
    )
  }).catch(() => {
    message.error(I18n.t('common.errors.something_wrong'))
  })

  const menuItems = [
    {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
          {confirmation && (
            <ConfirmationModal
              title={I18n.t('administration.scheduling.subjects.confirm_title')}
              message={
                I18n.t('administration.scheduling.subjects.confirm_message', { subject_name: subject?.user?.fullName })
              }
              onConfirm={handleOnConfirm}
              onCancel={() => setConfirmation(false)}
            />
          )}
        </>
      ),
    },
  ]

  return (
    <Menu items={menuItems} />
  )
}
