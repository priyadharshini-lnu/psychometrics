import React from 'react'
import {
  App,
  Button, MenuProps, Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { ProjectFilter } from '~/components/ProjectFilter'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'
import { FilterFilled } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

type Props = {
  openModal: (jobRole: JobRole) => void
}

export const JobRolesTable: React.FC<Props> = ({ openModal }) => {
  const { modal, message } = App.useApp()

  const { resource } = useResourceContext()

  const { projectId } = useParams()

  const filter = resource.getAppliedFiltersFromURL()

  const isProjectFilterApplied = (filter?.global || filter?.project_id_eq) ?? false

  const { DEFAULT_PRIMARY_COLOR } = constants

  const handleJobRoleDeletion = (jobRole: JobRole) => {
    modal.confirm({
      title: I18n.t('administration.project_tabs.webhooks.remove_webhook.title'),
      content: I18n.t(
        'administration.project_tabs.webhooks.remove_webhook.content',
        {
          description: jobRole.id,
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
          <div>
            <Typography.Text>{jobRole.name}</Typography.Text>
          </div>
        )}
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
        sorter
      />

      <Resource.Column<JobRole>
        title={I18n.t('common.column.description')}
        id="description"
        render={jobRole => <Typography.Text>{jobRole.description}</Typography.Text>}
        sorter
      />

      <Resource.Column<JobRole>
        title={I18n.t('administration.job_role.column.job_group')}
        id="jobGroupId"
        render={jobRole => <Typography.Text>{jobRole.jobGroup?.name}</Typography.Text>}
        sorter
      />

      {!projectId && (
        <Resource.Column<JobRole>
          title={I18n.t('common.column.project')}
          id="project.name"
          render={jobRole => (jobRole.project?.id ? (
            <Typography.Link
              copyable
              href={`/admin/projects/${jobRole.project?.id}/new_campaigns?filters[statusEq]=active`}
              target="_blank"
            >
              {jobRole.project?.name}
            </Typography.Link>
          ) : null)}
          width={200}
          sorter
          filterDropdown={() => (
            <ProjectFilter />
          )}
          filterIcon={() => (
            <FilterFilled
              style={{
                color: isProjectFilterApplied
                  ? DEFAULT_PRIMARY_COLOR : undefined,
              }}
            />
          )}
        />
      )}

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
      label: (
        <Button
          type="link"
          onClick={() => openModal(jobRole)}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    jobRole && {
      key: 'delete',
      label: (
        <Button
          type="link"
          onClick={() => onDelete(jobRole)}
          className="ps-0"
          danger
        >
          {I18n.t('common.actions.delete')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
