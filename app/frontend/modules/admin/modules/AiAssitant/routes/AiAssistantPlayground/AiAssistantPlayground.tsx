import React, { useState, useRef, useEffect } from 'react'
import {
  Input, Button,
  Flex, Form, Typography, theme,
  Select, Splitter, Avatar,
} from 'antd'
import { Bubble, Sender } from '@ant-design/x'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  HistoryOutlined, EditOutlined, CheckOutlined, CloseOutlined,
  UserOutlined, RobotOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { AiAssistantsPlaygroundBreadcrumb } from './AiAssistantsPlaygroundBreadcrumb'
import styles from './AiAssistantPlayground.less'
import { useResources } from '~/hooks/useResources/useResources'
import { AiAssistantTR, AiAssistant } from '../../core/aiAssistant'
import ResourceForm from '~/components/ResourceForm'
import { ASSISTANT_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'
import { getAvailableAiProviders } from '~/core/config'

const { Paragraph } = Typography
const MAX_LENGTH = 10000

type TokenInfo = {
  inputTokens: number
  outputTokens: number
  thinkingTokens: number | null
}

type Message = {
  text: string
  isUser: boolean
  tokens?: TokenInfo
}

const { I18n } = window

const TokenUsage: React.FC<{ tokens: TokenInfo }> = ({ tokens }) => {
  const { token } = theme.useToken()
  return (
    <Flex gap={12}>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {I18n.t('admin.used_tokens_input_tokens')}
        :
        {tokens.inputTokens}
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {I18n.t('admin.used_tokens_output_tokens')}
        :
        {tokens.outputTokens}
      </Typography.Text>
      {tokens.thinkingTokens != null && tokens.thinkingTokens > 0 && (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {I18n.t('admin.used_tokens_thinking_tokens')}
          :
          {tokens.thinkingTokens}
        </Typography.Text>
      )}
    </Flex>
  )
}


export const AiAssistantPlayground: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Welcome to AI Playground!\nType your prompt below.', isUser: false },
  ])
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form] = Form.useForm()
  const { aiAssistantId } = useParams() as { aiAssistantId: string }
  const availableAiProviders = useSelector(getAvailableAiProviders)

  const { fetchSingle, updateResource, collectionAction } = useResources('assistants', {
    basePath: 'ai',
    responseType: AiAssistantTR,
  })

  // Selected assistant state
  const [selectedAssistant, setSelectedAssistant] = useState<AiAssistant>()

  useEffect(() => {
    fetchSingle({ id: aiAssistantId }).then((assistant) => {
      setSelectedAssistant(assistant as AiAssistant)
      form.setFieldsValue(assistant)
    })
  }, [aiAssistantId])

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = () => {
    const prompt = input
    if (!prompt.trim()) return
    setMessages([...messages, { text: prompt, isUser: true }])
    setInput('')
    setLoading(true)
    collectionAction({
      action: `${aiAssistantId}/generate`,
      method: 'post',
      body: {
        prompt,
      },
    }).then((response: {
      attributes: {
        message: string | object
        inputTokens: number
        outputTokens: number
        thinkingTokens: number | null
      }
    }) => {
      const {
        message, inputTokens, outputTokens, thinkingTokens,
      } = response.attributes
      const displayText = typeof message === 'string' ? message : JSON.stringify(message, null, 2)

      setMessages(msgs => [
        ...msgs,
        {
          text: displayText,
          isUser: false,
          tokens: { inputTokens, outputTokens, thinkingTokens },
        },
      ])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }

  const handleInputChange = (value: string) => {
    if (value.length <= MAX_LENGTH) {
      setInput(value)
    }
  }

  const toggleEdit = () => {
    setEditMode(!editMode)
  }

  const handleSuccessfulSubmission = (response) => {
    setSelectedAssistant(response as AiAssistant)
    setEditMode(false)
  }

  const chatUI = (
    <div className={styles.mainContainer}>
      <Flex gap="middle" vertical flex="1 1 auto" className={styles.chatArea}>
        {messages.map((msg, idx) => (
          <>
            {idx === messages.length - 1 && (
              <div ref={chatEndRef} />
            )}
            <Bubble
              key={idx}
              placement={msg.isUser ? 'end' : 'start'}
              content={msg.text}
              styles={{ content: { maxWidth: 500 }, footer: { marginTop: 0, paddingTop: 0 } }}
              footer={!msg.isUser && msg.tokens ? <TokenUsage tokens={msg.tokens} /> : undefined}
              avatar={msg.isUser ? (
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
              ) : (
                <Avatar
                  icon={<RobotOutlined />}
                  style={{ backgroundColor: '#87d068' }}
                />
              )}
            />
          </>
        ))}
      </Flex>
      <Flex className={styles.senderContainer}>
        <Sender
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSend}
          autoSize={{ minRows: 4, maxRows: 6 }}
          suffix={(_, { components }) => {
            const { SendButton, LoadingButton } = components
            return (
              <Flex justify="space-between" align="center" gap="small">
                <Typography.Text type="secondary">
                  {`${input.length} / ${MAX_LENGTH}`}
                </Typography.Text>
                {loading ? (
                  <LoadingButton type="default" />
                ) : (
                  <SendButton type="primary" disabled={!input.trim() || input.length > MAX_LENGTH} />
                )}
              </Flex>
            )
          }}
        />
      </Flex>
    </div>
  )

  const aiModalUI = (
    <div className={styles.settingsPanel}>
      {selectedAssistant && (
        <ResourceForm
          resourceName="assistants"
          resourceBaseUrl="/ai"
          resource={selectedAssistant}
          readableResourceName="AI Assistant"
          storeManager={{ form }}
          request={{
            updateResource,
          }}
          formProps={{
            labelAlign: 'left',
            id: 'edit_ai_assistant_form',
            preserve: false,
            layout: 'vertical',
          }}
          scrollToFirstError
          onSuccessfulSubmission={handleSuccessfulSubmission}
        >
          {() => (
            <>
              <Flex
                justify="space-between"
                align="center"
                className={styles.settingsHeader}
              >
                <h3 className={styles.settingsTitle}>AI Assistant</h3>
                <Flex gap="small">
                  <Button
                    type="text"
                    icon={<HistoryOutlined />}
                    aria-label="View history"
                    className={styles.historyButton}
                  />
                  {editMode ? (
                    <>
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        aria-label="Save changes"
                        htmlType="submit"
                      />
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={toggleEdit}
                        aria-label="Cancel editing"
                      />
                    </>
                  ) : (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={toggleEdit}
                      aria-label="Edit assistant"
                    />
                  )}
                </Flex>
              </Flex>
              <div className={styles.settingsForm}>
                {editMode && (
                  <div className={styles.settingsFormContent}>
                    <Form.Item
                      name="name"
                      label="Name"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="description"
                      label="Description"
                    >
                      <Input.TextArea
                        rows={4}
                      />
                    </Form.Item>
                    <Form.Item
                      name="modelId"
                      label="Provider"
                    >
                      <Select>
                        {availableAiProviders.map(provider => (
                          <Select.Option key={provider.model_id} value={provider.model_id}>
                            {provider.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="assistantType"
                      label="Type"
                    >
                      <Select>
                        {Object.values(ASSISTANT_TYPES).map(type => (
                          <Select.Option key={type.id} value={type.id}>
                            {type.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="systemPrompt"
                      label="System Prompt"
                    >
                      <Input.TextArea
                        rows={4}
                      />
                    </Form.Item>

                    <Form.Item
                      name="userPrompt"
                      label="User Prompt Template"
                    >
                      <Input.TextArea
                        rows={4}
                      />
                    </Form.Item>
                  </div>
                )}
                {!editMode && selectedAssistant && (
                  <>
                    <div className={styles.settingsSection}>
                      <div className={styles.settingsLabel}>Name</div>
                      <Paragraph className={styles.promptText}>{selectedAssistant.name}</Paragraph>
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settingsLabel}>Description</div>
                      <Paragraph
                        ellipsis={{
                          rows: 4,
                          expandable: true,
                          symbol: 'Show more',
                        }}
                        className={styles.promptText}
                      >
                        {selectedAssistant.description}
                      </Paragraph>
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settingsLabel}>Provider</div>
                      <Paragraph className={styles.promptText}>
                        {availableAiProviders.find(
                          provider => provider.model_id === selectedAssistant.modelId,
                        )?.name}
                      </Paragraph>
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settingsLabel}>Action</div>
                      <Paragraph className={styles.promptText}>{selectedAssistant.assistantType}</Paragraph>
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settingsLabel}>System Prompt</div>
                      <Paragraph
                        ellipsis={{
                          rows: 4,
                          expandable: true,
                          symbol: 'Show more',
                        }}
                        className={styles.promptText}
                      >
                        {selectedAssistant.systemPrompt}
                      </Paragraph>
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settingsLabel}>User Prompt Template</div>
                      <Paragraph
                        ellipsis={{
                          rows: 4,
                          expandable: true,
                          symbol: 'Show more',
                        }}
                        className={styles.promptText}
                      >
                        {selectedAssistant.userPrompt}
                      </Paragraph>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

        </ResourceForm>
      )}
    </div>
  )

  return (
    <Flex vertical className={styles.aiAssistantPlayground}>
      <AiAssistantsPlaygroundBreadcrumb />
      <Flex className={styles.layout}>
        <Splitter>
          <Splitter.Panel defaultSize="80%" min="20%" max="80%">
            {chatUI}
          </Splitter.Panel>
          <Splitter.Panel defaultSize="30%" min="20%" max="80%">
            {aiModalUI}
          </Splitter.Panel>
        </Splitter>
      </Flex>
    </Flex>
  )
}
