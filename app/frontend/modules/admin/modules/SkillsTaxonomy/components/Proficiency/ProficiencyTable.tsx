import React from 'react'
import {
  App,
  Button, MenuProps, Table, Typography,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { ProficiencyLevel } from '~/modules/admin/modules/client/core/proficiencyLevels'
import { convertEnumToObject, getLabelForEnumValue } from '~/utils/object'
import { SkillTypeEnum } from '../../constants'
import { ProficiencyTypesEnum } from './constants'

const { I18n } = window

type Props = {
  openModal: (proficiencyLevel: ProficiencyLevel) => void
}
export const ProficiencyTable: React.FC<Props> = ({ openModal }) => {
  const { modal, message } = App.useApp()

  const { resource } = useResourceContext()

  const handleMappingDeletion = (proficiencyLevel: ProficiencyLevel) => {
    modal.confirm({
      title: I18n.t('administration.project_tabs.webhooks.remove_webhook.title'),
      content: I18n.t(
        'administration.project_tabs.webhooks.remove_webhook.content',
        {
          description: proficiencyLevel.id,
        },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        resource.removeResource(proficiencyLevel.id).then(() => {
          message.success('Success')
          close()
        }).catch(() => {
          message.error('Error')
        })
      },
    })
  }

  return (
    <Resource.Table
      pagination
      expandable={{
        expandedRowRender: record => (
          <Table
            dataSource={record.levelDefinition}
            columns={[
              {
                title: I18n.t('administration.proficiency_levels.fields.level'),
                key: 'level',
                dataIndex: 'level',
              },
              {
                title: I18n.t('administration.proficiency_levels.fields.level_name'),
                key: 'name',
                dataIndex: 'name',
              },
              {
                title: I18n.t('administration.proficiency_levels.fields.level_description'),
                key: 'description',
                dataIndex: 'description',
              },
            ]}
            pagination={false}
          />
        ),
      }}
    >
      <Resource.Column<ProficiencyLevel>
        title={I18n.t('common.column.id')}
        id="id"
        sorter
        render={proficiencyLevel => (
          proficiencyLevel.id
        )}
        width={200}
      />
      <Resource.Column<ProficiencyLevel>
        title={I18n.t('administration.proficiency_levels.fields.proficiency_type')}
        id="proficiency_type"
        render={(_, proficiencyLevel) => (
          <div>
            <Typography.Text>
              {I18n.t(`administration.proficiency_levels.type.${proficiencyLevel.proficiencyType}`)}
            </Typography.Text>
          </div>
        )}
        sorter
        filters={
          Object.values(convertEnumToObject(ProficiencyTypesEnum))
            .map(([key, value]) => ({ text: key, value }))
        }
        filteredValue={resource.getFilteredValue('proficiency_type_in') as string[]}
      />
      <Resource.Column<ProficiencyLevel>
        title={I18n.t('administration.proficiency_levels.fields.skill_name')}
        id="skill.name"
        render={(_, proficiencyLevel) => (
          <div>
            <Typography.Text>{proficiencyLevel.skill?.name}</Typography.Text>
          </div>
        )}
        sorter
      />
      <Resource.Column<ProficiencyLevel>
        title={I18n.t('administration.proficiency_levels.fields.skill_type')}
        id="skill_type"
        render={proficiencyLevel => (
          <Typography.Text>
            {
              proficiencyLevel.skillType ? (
                getLabelForEnumValue(SkillTypeEnum, proficiencyLevel.skillType)
              ) : null
            }
          </Typography.Text>
        )}
        sorter
        filters={
          Object.values(convertEnumToObject(SkillTypeEnum))
            .map(([key, value]) => ({ text: key, value }))
        }
        filteredValue={resource.getFilteredValue('skill_type_in') as string[]}
      />

      <Resource.Column<ProficiencyLevel>
        title={I18n.t('administration.proficiency_levels.fields.level')}
        id="level"
        render={(_, proficiencyLevel) => (
          <div>
            <Typography.Text>{proficiencyLevel.level}</Typography.Text>
          </div>
        )}
        sorter
        filters={
          Array.from({ length: 9 }).map((_, index) => ({ text: index + 2, value: index + 2 }))
        }
        filteredValue={resource.getFilteredValue('level_in') as string[]}
      />

      <Resource.Column<ProficiencyLevel>
        title={I18n.t('common.column.action')}
        id="action"
        render={(_, proficiencyLevel) => (
          <Dropdown
            proficiencyLevel={proficiencyLevel}
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
    proficiencyLevel: ProficiencyLevel,
    onDelete: (proficiencyLevel: ProficiencyLevel) => void,
    openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ proficiencyLevel, onDelete, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ proficiencyLevel, onDelete, openModal })}
  />
)

interface ActionMenuData {
  proficiencyLevel: ProficiencyLevel,
  onDelete: (mapping: ProficiencyLevel) => void,
  openModal: Props['openModal']
}

const getActionsMenuProps = ({ proficiencyLevel, onDelete, openModal }: ActionMenuData):MenuProps => {
  const menuItems = [
    proficiencyLevel && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal(proficiencyLevel)}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    proficiencyLevel && {
      key: 'delete',
      label: (
        <Button
          type="link"
          onClick={() => onDelete(proficiencyLevel)}
          className="ps-0"
          danger
        >
          {I18n.t('common.actions.delete')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
