import React, { useState } from 'react'
import {
  App,
  MenuProps, Typography,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { DetailsDrawer } from './DetailsDrawer'

const { I18n } = window

type Props = {
  openModal: (jobRole: JobRole) => void
}

export const JobRolesTable: React.FC<Props> = ({ openModal }) => {
  const [jobRoleDetails, setJobRoleDetails] = useState<JobRole>()

  const { modal, message } = App.useApp()

  const { resource } = useResourceContext()

  const handleJobRoleDeletion = (jobRole: JobRole) => {
    modal.confirm({
      title: I18n.t('shared.delete'),
      content: I18n.t(
        'admin.project_tabs_webhooks_remove_webhook_content',
        {
          description: jobRole.name,
        },
      ),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t(
        'shared.cancel',
      ),
      onOk: async () => {
        resource.removeResource(jobRole.id).then(() => {
          message.success('Success')
          close()
        }).catch(() => {
          message.error('Error')
        })
      },
    })
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<JobRole>
          title={I18n.t('shared.id')}
          id="id"
          sorter
          render={jobRole => (
            jobRole.id
          )}
          width={200}
        />
        <Resource.Column<JobRole>
          title={I18n.t('shared.name')}
          id="name"
          render={(_, jobRole) => (
            <Typography.Link onClick={() => setJobRoleDetails(jobRole)}>
              {jobRole.name}
            </Typography.Link>
          )}
          minWidth={200}
          sorter
        />

        <Resource.Column<JobRole>
          title={I18n.t('shared.code')}
          id="code"
          render={(_, jobRole) => (
            <div>
              <Typography.Text>{jobRole.code}</Typography.Text>
            </div>
          )}
          minWidth={150}
          sorter
        />

        <Resource.Column<JobRole>
          title={I18n.t('admin.job_role_column_job_group')}
          id="jobGroupId"
          render={jobRole => <Typography.Text>{jobRole.jobGroup?.name}</Typography.Text>}
          minWidth={150}
          sorter
        />

        <Resource.Column<JobRole>
          title={I18n.t('shared.last_updated')}
          id="updatedAt"
          width={200}
          sorter
        />

        <Resource.Column<JobRole>
          title={I18n.t('shared.action')}
          id="action"
          render={(_, jobRole) => (
            <Dropdown
              jobRole={jobRole}
              onDelete={handleJobRoleDeletion}
              openModal={openModal}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <DetailsDrawer
        onClose={() => setJobRoleDetails(undefined)}
        jobRole={jobRoleDetails}
      />
    </>
  )
}

type DropDownProps = {
    jobRole: JobRole,
    onDelete: (jobRole: JobRole) => void,
    openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ jobRole, onDelete, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ jobRole, onDelete, openModal })}
  />
)

interface ActionMenuData {
  jobRole: JobRole,
  onDelete: (jobRole: JobRole) => void,
  openModal: Props['openModal']
}

const getActionsMenuProps = ({ jobRole, onDelete, openModal }: ActionMenuData):MenuProps => {
  const menuItems = [
    jobRole && {
      key: 'edit',
      label: I18n.t('shared.edit'),
      onClick: () => openModal(jobRole),
    },
    jobRole && {
      key: 'delete',
      label: I18n.t('shared.delete'),
      onClick: () => onDelete(jobRole),
      danger: true,
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
