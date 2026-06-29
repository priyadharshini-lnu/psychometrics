import React, { useState } from 'react'
import {
  Button, MenuProps, message, Typography, Drawer, Tooltip, Row, Col,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ReactMarkdown from 'react-markdown'
import { AiAssistant } from 'modules/admin/modules/AiAssitant/core/aiAssistant'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CopyOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ASSISTANT_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getAvailableAiProviders } from '~/core/config'

const { I18n } = window

const estimateTokenCount = (text: string | null | undefined): number => {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

export const AiAssistantsTable = () => {
  const availableAiProviders = useSelector(getAvailableAiProviders)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [drawerTitle, setDrawerTitle] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const { resource } = useResourceContext<AiAssistant>()

  const handleShowPrompt = (prompt: string, title: string) => {
    setSelectedPrompt(prompt)
    setDrawerTitle(title)
    setDrawerOpen(true)
    setCopied(false)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedPrompt('')
    setDrawerTitle('')
    setCopied(false)
  }

  const handleCopy = () => {
    setCopied(true)
    message.success(I18n.t('admin.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const assistantTypeFilters = Object.values(ASSISTANT_TYPES).map(type => ({
    text: type.name,
    value: type.id,
  }))

  const providerFilters = availableAiProviders.map(provider => ({
    text: provider.name,
    value: provider.model_id,
  }))


  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<AiAssistant>
          title={I18n.t('shared.id')}
          id="id"
          sorter
          render={aiAssistant => (
            aiAssistant.id
          )}
          width={100}
        />
        <Resource.Column<AiAssistant>
          title={I18n.t('shared.name')}
          id="name"
          render={aiAssistant => <Typography.Text>{aiAssistant.name}</Typography.Text>}
          sorter
          width={200}
        />
        <Resource.Column<AiAssistant>
          title={I18n.t('shared.description')}
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
          title={I18n.t('admin.common_type')}
          id="assistant_type"
          render={aiAssistant => <Typography.Text>{ASSISTANT_TYPES[aiAssistant.assistantType]?.name}</Typography.Text>}
          sorter
          filters={assistantTypeFilters}
          filteredValue={resource
            .getFilteredValue('assistant_type_in') as string[]
  }
        />
        <Resource.Column<AiAssistant>
          title={I18n.t('admin.column_provider')}
          id="model_id"
          render={
            aiAssistant => (availableAiProviders.find(provider => provider.model_id === aiAssistant.modelId)?.name)
          }
          width={200}
          sorter
          filters={providerFilters}
          filteredValue={resource.getFilteredValue('model_id_in') as string[]}
        />
        <Resource.Column<AiAssistant>
          title={I18n.t('admin.system_prompt')}
          id="system_prompt"
          render={aiAssistant => (
            <div>
              <Typography.Paragraph
                ellipsis={{ rows: 2 }}
                style={{ margin: 0, marginBottom: 4 }}
              >
                {aiAssistant.systemPrompt || '-'}
              </Typography.Paragraph>
              {aiAssistant.systemPrompt && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleShowPrompt(
                    aiAssistant.systemPrompt,
                    `${aiAssistant.name} - ${I18n.t('admin.system_prompt')}`,
                  )}
                  className="p-0"
                  style={{ fontSize: '12px' }}
                >
                  {I18n.t('shared.show_more')}
                </Button>
              )}
            </div>
          )}
          width={200}
          sorter
        />
        <Resource.Column<AiAssistant>
          title={I18n.t('admin.user_prompt')}
          id="user_prompt"
          render={aiAssistant => (
            <div>
              <Typography.Paragraph
                ellipsis={{ rows: 2 }}
                style={{ margin: 0, marginBottom: 4 }}
              >
                {aiAssistant.userPrompt || '-'}
              </Typography.Paragraph>
              {aiAssistant.userPrompt && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleShowPrompt(
                    aiAssistant.userPrompt,
                    `${aiAssistant.name} - ${I18n.t('admin.user_prompt')}`,
                  )}
                  className="p-0"
                  style={{ fontSize: '12px' }}
                >
                  {I18n.t('shared.show_more')}
                </Button>
              )}
            </div>
          )}
          width={200}
          sorter
        />
        <Resource.Column<AiAssistant>
          title={I18n.t('shared.action')}
          id="action"
          render={(_, aiAssistant) => (
            <Dropdown
              aiAssistant={aiAssistant}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <Drawer
        title={(
          <Row justify="space-between" align="middle" style={{ paddingRight: 24 }}>
            <Col>{drawerTitle}</Col>
            <Col>
              <CopyToClipboard text={selectedPrompt} onCopy={handleCopy}>
                <Tooltip title={copied ? I18n.t('admin.copied') : I18n.t('shared.copy')}>
                  <Button
                    type="text"
                    icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                  />
                </Tooltip>
              </CopyToClipboard>
            </Col>
          </Row>
        )}
        placement="right"
        closable
        onClose={handleCloseDrawer}
        open={drawerOpen}
        width="50%"
      >
        <Row
          justify="space-between"
          style={{
            marginBottom: 16, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4,
          }}
        >
          <Col>
            <Typography.Text type="secondary">
              {selectedPrompt.length.toLocaleString()}
              {' '}
              {I18n.t('admin.characters')}
            </Typography.Text>
          </Col>
          <Col>
            <Typography.Text type="secondary">
              ~
              {estimateTokenCount(selectedPrompt).toLocaleString()}
              {' '}
              {I18n.t('admin.estimated_tokens')}
            </Typography.Text>
          </Col>
        </Row>
        <div style={{ padding: '0 4px' }}>
          <ReactMarkdown>{selectedPrompt}</ReactMarkdown>
        </div>
      </Drawer>
    </>
  )
}

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
    resource.removeResource(aiAssistant.id).catch((error) => {
      message.error(error?.base?.[0].title)
    })
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
          {I18n.t('shared.edit')}
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
          {I18n.t('admin.actions_playground')}
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
          {I18n.t('shared.delete')}
        </Button>
      ),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
