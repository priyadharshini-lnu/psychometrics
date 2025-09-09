import React, { useState } from 'react'
import {
  Button, MenuProps, Typography,
} from 'antd'
import { useResourceContext, Resource } from '~/modules/admin/components/Resource'
import { MenuItem } from '~/interfaces/Antd'
import { getLabelForEnumValue, convertEnumToObject } from '~/utils/object'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TagList } from '~/modules/admin/components/Resource/TagList'
import { SkillTypeEnum } from '../../constants'
import { DetailsDrawer } from './DetailsDrawer'

const { I18n } = window

type Props = {
  openModal: (skill?: Skill) => void,
 }
export const SkillsTable: React.FC<Props> = ({ openModal }) => {
  const [skillDetails, setSkillDetails] = useState<Skill>()

  const { resource } = useResourceContext<Skill>()

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<Skill>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={skill => (
            skill.id
          )}
          width={150}
        />
        <Resource.Column<Skill>
          title={I18n.t('common.column.name')}
          id="name"
          render={(_, skill) => (
            <>
              <Typography.Link onClick={() => setSkillDetails(skill)} style={{ marginRight: 12 }}>
                {skill.name}
              </Typography.Link>
              <TagList
                initialTags={skill.tagList as string[]}
                config={{
                  editable: false,
                }}
              />
            </>
          )}
          sorter
        />
        <Resource.Column<Skill>
          title={I18n.t('administration.skills.columns.skill_type')}
          id="skill_type"
          width={200}
          render={skill => <Typography.Text>{getLabelForEnumValue(SkillTypeEnum, skill.skillType)}</Typography.Text>}
          sorter
          filters={
                  Object.values(convertEnumToObject(SkillTypeEnum))
                    .map(([key, value]) => ({ text: key, value }))
                }
          filteredValue={resource.getFilteredValue('skill_type_in') as string[]}
        />
        <Resource.Column<Skill>
          title={I18n.t('administration.skills.columns.skill_group')}
          id="skillGroupId"
          render={skill => <Typography.Text>{skill.skillGroup?.name}</Typography.Text>}
          sorter
        />
        <Resource.Column<Skill>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          width={200}
          sorter
        />
        <Resource.Column<Skill>
          title={I18n.t('common.column.action')}
          id="action"
          render={(_, skill) => (
            <Dropdown
              skill={skill}
              openModal={openModal}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <DetailsDrawer onClose={() => setSkillDetails(undefined)} skill={skillDetails} />
    </>
  )
}

type DropDownProps = {
    skill: Skill,
    openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ skill, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ skill, openModal })}
  />
)

interface ActionMenuData {
    skill: Skill,
  openModal: Props['openModal']
}

const getActionsMenuProps = ({ skill, openModal }: ActionMenuData):MenuProps => {
  const menuItems = [
    skill && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal(skill)}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
