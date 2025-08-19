import React from 'react'
import {
  Button, MenuProps, Typography,
} from 'antd'
import { AiAssistant } from 'modules/admin/modules/AiAssitant/core/aiAssistant'
import { useNavigate } from 'react-router-dom'
import { AI_PROVIDERS, ASSISTANT_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const AiAssistantsTable = () => (
  <Resource.Table pagination>
    <Resource.Column<AiAssistant>
      title={I18n.t('common.column.id')}
      id="id"
      sorter
      render={aiAssistant => (
        aiAssistant.id
      )}
      width={100}
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('common.column.name')}
      id="name"
      render={aiAssistant => <Typography.Text>{aiAssistant.name}</Typography.Text>}
      sorter
      width={200}
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('common.column.description')}
      id="description"
      render={aiAssistant => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: 'Show more',
          }}
          style={{ margin: 0 }}
        >
          {aiAssistant.description}
        </Typography.Paragraph>
      )}
      width={200}
      sorter
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('administration.ai_assistants.column.provider')}
      id="modelId"
      render={aiAssistant => (AI_PROVIDERS[aiAssistant.modelId]?.name)}
      width={200}
      sorter
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('administration.ai_assistants.form.system_prompt')}
      id="system_prompt"
      render={aiAssistant => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: 'Show more',
          }}
          style={{ margin: 0 }}
        >
          {aiAssistant.systemPrompt}
        </Typography.Paragraph>
      )}
      width={200}
      sorter
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('administration.ai_assistants.form.user_prompt')}
      id="user_prompt"
      render={aiAssistant => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: 'Show more',
          }}
          style={{ margin: 0 }}
        >
          {aiAssistant.userPrompt}
        </Typography.Paragraph>
      )}
      width={200}
      sorter
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('administration.common.type')}
      id="assistantType"
      render={aiAssistant => <Typography.Text>{ASSISTANT_TYPES[aiAssistant.assistantType]?.name}</Typography.Text>}
      sorter
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('common.column.action')}
      id="action"
      render={(_, aiAssistant) => (
        <Dropdown
          aiAssistant={aiAssistant}
        />
      )}
      width={100}
    />
  </Resource.Table>
)

type DropDownProps = {
  aiAssistant: AiAssistant,
}
const Dropdown: React.FC<DropDownProps> = ({ aiAssistant }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ aiAssistant })}
  />
)

interface ActionMenuData {
  aiAssistant: AiAssistant,
}

const getActionsMenuProps = ({ aiAssistant }: ActionMenuData):MenuProps => {
  const { resource } = useResourceContext<AiAssistant>()
  const navigate = useNavigate()

  const handleDelete = () => {
    resource.removeResource(aiAssistant.id)
  }

  const menuItems = [
    aiAssistant && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => navigate(`${aiAssistant.id}/edit/`)}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    {
      key: 'playground',
      label: (
        <Button
          type="link"
          className="ps-0"
          onClick={() => navigate(`${aiAssistant.id}/playground/`)}
        >
          {I18n.t('administration.ai_assistants.actions.playground')}
        </Button>
      ),
    },
    {
      key: 'delete',
      label: (
        <Button
          type="link"
          className="ps-0"
          onClick={handleDelete}
        >
          {I18n.t('common.actions.delete')}
        </Button>
      ),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
