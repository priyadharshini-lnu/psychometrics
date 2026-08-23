import React from 'react'
import {
  Button,
} from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'

const { I18n } = window

type Props = {
    onEditAIArtifact: (aiArtifact: AiArtifact) => void
}
export const SettingsTable: React.FC<Props> = ({ onEditAIArtifact }:Props) => {
  const { resource } = useResourceContext<AiArtifact>()

  const handleDeleteAIArtifact = (id: string) => {
    resource.removeResource(id)
  }
  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<AiArtifact>
          title={I18n.t('shared.id')}
          id="id"
          hideable={false}
          sorter
          width={100}
          fixed="left"
        />
        <Resource.Column<AiArtifact>
          title={I18n.t('shared.name')}
          id="name"
          sorter
          width={200}
          fixed="left"
        />
        <Resource.Column<AiArtifact>
          title={I18n.t('shared.code')}
          id="code"
          width={200}
          render={(_, aiArtifact) => <span>{aiArtifact.code}</span>}
        />
        <Resource.Column<AiArtifact>
          title={I18n.t('admin.ai_assistant')}
          id="aiAssistant"
          width={200}
          render={(_, aiArtifact) => (
            <span>{aiArtifact.aiAssistant?.name}</span>
          )}
        />
        <Resource.Column<AiArtifact>
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          render={(_, aiArtifact) => (
            <Dropdown
              aiArtifact={aiArtifact}
              onEditAIArtifact={onEditAIArtifact}
              onDeleteAIArtifact={handleDeleteAIArtifact}
            />
          )}
          width={100}
          fixed="right"
        />
      </Resource.Table>
    </>
  )
}

const Dropdown = props => (
  <ConditionalDropdown
    menu={getActionsMenuProps(props)}
  />
)

type MenuProps = {
    aiArtifact: AiArtifact
    onEditAIArtifact: (aiArtifact: AiArtifact) => void
    onDeleteAIArtifact: (id: string) => void
}

const getActionsMenuProps = ({ aiArtifact, onEditAIArtifact, onDeleteAIArtifact }: MenuProps) => {
  const menuItems = [
    {
      key: 'edit',
      label: (
        <Button
          type="link"
          className="ps-0"
          onClick={() => onEditAIArtifact(aiArtifact)}
        >
          {I18n.t('shared.edit')}
        </Button>),
    },
    {
      key: 'delete',
      label: (
        <Button
          type="link"
          className="ps-0"
          onClick={() => onDeleteAIArtifact(aiArtifact.id)}
        >
          {I18n.t('shared.delete')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
