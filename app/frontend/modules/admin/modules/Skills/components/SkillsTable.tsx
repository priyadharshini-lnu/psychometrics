import React from 'react'
import {
  Button, MenuProps, Typography,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useParams } from 'react-router'
import { getLabelForEnumValue } from '~/utils/object'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import { Resource } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TagList } from '~/modules/admin/components/Resource/TagList'
import { SkillCategoryEnum } from '../constants'


const { I18n } = window

type Props = {
  openModal: (skill?: Skill) => void
}
export const SkillsTable: React.FC<Props> = ({ openModal }) => {
  const { projectId } = useParams()

  return (
    <Resource.Table pagination>
      <Resource.Column<Skill>
        title={I18n.t('common.column.id')}
        id="id"
        sorter
        render={skill => (
          skill.id
        )}
        width={200}
      />
      <Resource.Column<Skill>
        title={I18n.t('common.column.name')}
        id="name"
        render={(_, skill) => (
          <>
            <div>
              <Typography.Text>{skill.name}</Typography.Text>
            </div>
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
        title={I18n.t('common.column.description')}
        id="description"
        render={skill => <Typography.Text>{skill.description}</Typography.Text>}
        sorter
      />
      <Resource.Column<Skill>
        title={I18n.t('common.column.category')}
        id="category"
        width={200}
        render={skill => <Typography.Text>{getLabelForEnumValue(SkillCategoryEnum, skill.category)}</Typography.Text>}
      />
      {!projectId && (
        <Resource.Column<Skill>
          title={I18n.t('common.column.project')}
          id="project.name"
          render={skill => (skill.project?.id ? (
            <Typography.Link
              copyable
              href={`/admin/projects/${skill.project?.id}/new_campaigns?filters[statusEq]=active`}
              target="_blank"
            >
              {skill.project?.name}
            </Typography.Link>
          ) : null)}
          width={200}
          sorter
        />
      )}
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
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}
