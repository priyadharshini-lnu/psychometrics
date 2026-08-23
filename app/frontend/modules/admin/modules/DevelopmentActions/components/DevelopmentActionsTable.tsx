import React from 'react'
import {
  Button, MenuProps, Typography,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import { TagList } from '~/modules/admin/components/Resource/TagList'
import { DevelopmentAction } from '~/modules/admin/modules/client/core/developmentAction'
import { Resource } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Props = {
  openModal: (developmentAction?: DevelopmentAction) => void,
}
export const DevelopmentActionsTable: React.FC<Props> = ({ openModal }) => (
  <Resource.Table pagination>
    <Resource.Column<DevelopmentAction>
      title={I18n.t('common.column.id')}
      id="id"
      hideable={false}
      sorter
      render={skill => (
        skill.id
      )}
      width={150}
      fixed="left"
    />
    <Resource.Column<DevelopmentAction>
      title={I18n.t('common.column.name')}
      id="name"
      render={(_, developmentAction) => (
        <>
          <Typography.Text style={{ marginRight: 12 }}>{developmentAction.name}</Typography.Text>
          <TagList
            initialTags={developmentAction.tagList as string[]}
            config={{
              editable: false,
            }}
          />
        </>
      )}
      sorter
      minWidth={200}
      fixed="left"
    />
    <Resource.Column<DevelopmentAction>
      title={I18n.t('common.column.description')}
      id="description"
      render={developmentAction => <Typography.Text>{developmentAction.description}</Typography.Text>}
      sorter
    />
    <Resource.Column<DevelopmentAction>
      title={I18n.t('common.column.skills')}
      id="skills"
      render={(_, developmentAction) => (
        <>
          <TagList
            initialTags={developmentAction.skills?.map(s => s.name) as string[]}
            config={{
              editable: false,
            }}
          />
        </>
      )}
      width={200}
    />
    <Resource.Column<DevelopmentAction>
      title={I18n.t('common.column.updated_at')}
      id="updated_at"
      width={200}
      sorter
    />
    <Resource.Column<DevelopmentAction>
      title={I18n.t('common.column.action')}
      id="action"
      hideable={false}
      render={(_, developmentAction) => (
        <Dropdown
          developmentAction={developmentAction}
          openModal={openModal}
        />
      )}
      width={100}
      fixed="right"
    />
  </Resource.Table>
)

type DropDownProps = {
    developmentAction: DevelopmentAction,
    openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ developmentAction, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ developmentAction, openModal })}
  />
)

interface ActionMenuData {
    developmentAction: DevelopmentAction,
    openModal: Props['openModal']
}

const getActionsMenuProps = ({ developmentAction, openModal }: ActionMenuData):MenuProps => {
  const menuItems = [
    developmentAction.meta.permissions.edit && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => {
            openModal(developmentAction)
          }}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
