import React from 'react'
import {
  Button, MenuProps, Typography,
} from 'antd'
import { AiAssistant } from 'modules/admin/modules/AiAssitant/core/aiAssistant'
import { useNavigate } from 'react-router-dom'
import { AI_PROVIDERS } from '~/modules/admin/modules/AiAssitant/core/constants'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Props = {
  openModal: (aiAssistant?: AiAssistant) => void
}
export const AiAssistantsTable: React.FC<Props> = ({ openModal }) => (
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
      id="providerId"
      render={aiAssistant => (AI_PROVIDERS[aiAssistant.providerId]?.name)}
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
      title={I18n.t('administration.ai_assistants.column.ai_action')}
      id="ai_action"
      render={aiAssistant => <Typography.Text>{aiAssistant.action}</Typography.Text>}
      sorter
    />
    <Resource.Column<AiAssistant>
      title={I18n.t('common.column.action')}
      id="action"
      render={(_, aiAssistant) => (
        <Dropdown
          aiAssistant={aiAssistant}
          openModal={openModal}
        />
      )}
      width={100}
    />
  </Resource.Table>
)

type DropDownProps = {
  aiAssistant: AiAssistant,
    openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ aiAssistant, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ aiAssistant, openModal })}
  />
)

interface ActionMenuData {
  aiAssistant: AiAssistant,
  openModal: Props['openModal']
}

const getActionsMenuProps = ({ aiAssistant, openModal }: ActionMenuData):MenuProps => {
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
          onClick={() => openModal(aiAssistant)}
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
