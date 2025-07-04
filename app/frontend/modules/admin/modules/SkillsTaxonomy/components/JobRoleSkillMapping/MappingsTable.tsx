import React from 'react'
import {
  App,
  Button, MenuProps, Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { JobRoleSkillMapping } from '~/modules/admin/modules/client/core/jobRoleSkillMappings'
import { FilterFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { ProjectFilter } from '~/components/ProjectFilter'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'

const { I18n } = window

type Props = {
  openModal: (mapping: JobRoleSkillMapping) => void
}
export const MappingsTable: React.FC<Props> = ({ openModal }) => {
  const { modal, message } = App.useApp()

  const { resource } = useResourceContext()

  const { projectId } = useParams()

  const filter = resource.getAppliedFiltersFromURL()

  const isProjectFilterApplied = (filter?.global || filter?.project_id_eq) ?? false

  const { DEFAULT_PRIMARY_COLOR } = constants

  const handleMappingDeletion = (mapping: JobRoleSkillMapping) => {
    modal.confirm({
      title: I18n.t('administration.project_tabs.webhooks.remove_webhook.title'),
      content: I18n.t(
        'administration.project_tabs.webhooks.remove_webhook.content',
        {
          description: mapping.id,
        },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        resource.removeResource(mapping.id).then(() => {
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
      <Resource.Column<JobRoleSkillMapping>
        title={I18n.t('common.column.id')}
        id="id"
        sorter
        render={mapping => (
          mapping.id
        )}
        width={200}
      />
      <Resource.Column<JobRoleSkillMapping>
        title={I18n.t('administration.job_role_skill_mapping.column.job_role')}
        id="job_role.name"
        render={(_, mapping) => (
          <div>
            <Typography.Text>{mapping.jobRole?.name}</Typography.Text>
          </div>
        )}
        sorter
      />
      <Resource.Column<JobRoleSkillMapping>
        title={I18n.t('administration.job_role_skill_mapping.column.skill')}
        id="skill.name"
        render={(_, mapping) => (
          <div>
            <Typography.Text>{mapping.skill?.name}</Typography.Text>
          </div>
        )}
        sorter
      />
      <Resource.Column<JobRoleSkillMapping>
        title={I18n.t('administration.job_role_skill_mapping.column.expected_proficiency_level')}
        id="expectedProficiencyLevel"
        render={(_, mapping) => (
          <div>
            <Typography.Text>{mapping.expectedProficiencyLevel}</Typography.Text>
          </div>
        )}
        sorter
      />
      {!projectId && (
        <Resource.Column<JobRoleSkillMapping>
          title={I18n.t('common.column.project')}
          id="project.name"
          render={mapping => (mapping.project?.id ? (
            <Typography.Link
              copyable
              href={`/admin/projects/${mapping.project?.id}/new_campaigns?filters[statusEq]=active`}
              target="_blank"
            >
              {mapping.project?.name}
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
      <Resource.Column<JobRoleSkillMapping>
        title={I18n.t('common.column.action')}
        id="action"
        render={(_, mapping) => (
          <Dropdown
            mapping={mapping}
            onDelete={handleMappingDeletion}
            openModal={openModal}
          />
        )}
        width={100}
      />
    </Resource.Table>
  )
}

type DropDownProps = {
    mapping: JobRoleSkillMapping,
    onDelete: (mapping: JobRoleSkillMapping) => void,
    openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ mapping, onDelete, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ mapping, onDelete, openModal })}
  />
)

interface ActionMenuData {
  mapping: JobRoleSkillMapping,
  onDelete: (mapping: JobRoleSkillMapping) => void,
  openModal: Props['openModal']
}

const getActionsMenuProps = ({ mapping, onDelete, openModal }: ActionMenuData):MenuProps => {
  const menuItems = [
    mapping && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal(mapping)}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    mapping && {
      key: 'delete',
      label: (
        <Button
          type="link"
          onClick={() => onDelete(mapping)}
          className="ps-0"
          danger
        >
          {I18n.t('common.actions.delete')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
