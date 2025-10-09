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
      title: I18n.t('administration.project_tabs.webhooks.remove_webhook.title'),
      content: I18n.t(
        'administration.project_tabs.webhooks.remove_webhook.content',
        {
          description: jobRole.name,
        },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
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
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={jobRole => (
            jobRole.id
          )}
          width={200}
        />
        <Resource.Column<JobRole>
          title={I18n.t('common.column.name')}
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
          title={I18n.t('common.column.code')}
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
          title={I18n.t('administration.job_role.column.job_group')}
          id="jobGroupId"
          render={jobRole => <Typography.Text>{jobRole.jobGroup?.name}</Typography.Text>}
          minWidth={150}
          sorter
        />

        <Resource.Column<JobRole>
          title={I18n.t('common.column.updated_at')}
          id="updatedAt"
          width={200}
          sorter
        />

        <Resource.Column<JobRole>
          title={I18n.t('common.column.action')}
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
      label: I18n.t('common.actions.edit'),
      onClick: () => openModal(jobRole),
    },
    jobRole && {
      key: 'delete',
      label: I18n.t('common.actions.delete'),
      onClick: () => onDelete(jobRole),
      danger: true,
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
