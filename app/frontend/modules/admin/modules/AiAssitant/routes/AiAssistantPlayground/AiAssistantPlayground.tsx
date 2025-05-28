import React, { useState, useRef, useEffect } from 'react'
import {
  Card, Input, Button,
  Flex, Form, Typography,
  Select, Splitter,
} from 'antd'
import {
  SendOutlined, HistoryOutlined, EditOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiAssistantsPlaygroundBreadcrumb } from './AiAssistantsPlaygroundBreadcrumb'
import styles from './AiAssistantPlayground.less'
import { useResources } from '~/hooks/useResources/useResources'
import { AiAssistantTR, AiAssistant } from '../../core/aiAssistant'
import ResourceForm from '~/components/ResourceForm'
import { AI_ACTIONS, AI_PROVIDERS } from '~/modules/admin/modules/AiAssitant/core/constants'
import { getAvailableAiProviders } from '~/core/config'

const { Paragraph } = Typography

export const AiAssistantPlayground: React.FC = () => {
  const [messages, setMessages] = useState([
    { text: 'Welcome to AI Playground!\nType your prompt below.', isUser: false },
  ])
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const MAX_LENGTH = 3000
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
    collectionAction({
      action: `${aiAssistantId}/generate`,
      method: 'post',
      body: {
        prompt,
      },
    }).then((response: { attributes: { message: string } }) => {
      setMessages(msgs => [
        ...msgs,
        {
          text: response.attributes.message,
          isUser: false,
        },
      ])
    })
  }

  const toggleEdit = () => {
    setEditMode(!editMode)
  }

  const handleSuccessfulSubmission = (response) => {
    setSelectedAssistant(response as AiAssistant)
    setEditMode(false)
  }

  const chatUI = (
    <div className={styles['ai-assistant-playground__main-container']}>
      <div
        className={styles['ai-assistant-playground__chat-area']}
        role="log"
        aria-live="polite"
        aria-label="AI chat conversation"
      >
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} text={msg.text} isUser={msg.isUser} />
        ))}
        <div ref={chatEndRef} className={styles['ai-assistant-playground__scroll-anchor']} />
      </div>

      <div className={styles['ai-assistant-playground__input-container']}>
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Summarize the latest..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          className={styles['ai-assistant-playground__input']}
          maxLength={MAX_LENGTH}
        />

        <div className={styles['ai-assistant-playground__input-footer']}>
          <div className={styles['ai-assistant-playground__char-count']}>
            {input.length}
            <span> / </span>
            <span>{MAX_LENGTH}</span>
          </div>
          <Button
            type="text"
            icon={<SendOutlined />}
            onClick={handleSend}
            className={styles['ai-assistant-playground__send-button']}
            aria-label="Send"
          />
        </div>
      </div>
    </div>
  )

  const aiModalUI = (
    <div className={styles['ai-assistant-playground__settings-panel']}>
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
                className={styles['ai-assistant-playground__settings-header']}
              >
                <h3 className={styles['ai-assistant-playground__settings-title']}>AI Assistant</h3>
                <Flex gap="small">
                  <Button
                    type="text"
                    icon={<HistoryOutlined />}
                    aria-label="View history"
                    className={styles['ai-assistant-playground__history-button']}
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
              <div className={styles['ai-assistant-playground__settings-form']}>
                {editMode && (
                  <div className={styles['ai-assistant-playground__settings-form-content']}>
                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <Form.Item
                        name="name"
                        label="Name"
                        className={styles['ai-assistant-playground__form-item']}
                      >
                        <Input />
                      </Form.Item>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <Form.Item
                        name="description"
                        label="Description"
                        className={styles['ai-assistant-playground__form-item']}
                      >
                        <Input.TextArea
                          rows={4}
                        />
                      </Form.Item>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <Form.Item
                        name="providerId"
                        label="Provider"
                        className={styles['ai-assistant-playground__form-item']}
                      >
                        <Select>
                          {availableAiProviders.map(provider => (
                            <Select.Option key={provider} value={provider}>
                              {AI_PROVIDERS[provider].name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <Form.Item
                        name="action"
                        label="Action"
                        className={styles['ai-assistant-playground__form-item']}
                      >
                        <Select>
                          {Object.values(AI_ACTIONS).map(action => (
                            <Select.Option key={action.id} value={action.id}>
                              {action.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <Form.Item
                        name="systemPrompt"
                        label="System Prompt"
                        className={styles['ai-assistant-playground__form-item']}
                      >
                        <Input.TextArea
                          rows={4}
                        />
                      </Form.Item>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <Form.Item
                        name="userPrompt"
                        label="User Prompt Template"
                        className={styles['ai-assistant-playground__form-item']}
                      >
                        <Input.TextArea
                          rows={4}
                        />
                      </Form.Item>
                    </div>
                  </div>
                )}
                {!editMode && selectedAssistant && (
                  <>
                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <div className={styles['ai-assistant-playground__settings-label']}>Name</div>
                      <Paragraph>{selectedAssistant.name}</Paragraph>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <div className={styles['ai-assistant-playground__settings-label']}>Description</div>
                      <Paragraph
                        ellipsis={{
                          rows: 3,
                          expandable: true,
                          symbol: 'Show more',
                        }}
                        className={styles['ai-assistant-playground__prompt-text']}
                      >
                        {selectedAssistant.description}
                      </Paragraph>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <div className={styles['ai-assistant-playground__settings-label']}>Provider</div>
                      <Paragraph>{AI_PROVIDERS[selectedAssistant.providerId]?.name}</Paragraph>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <div className={styles['ai-assistant-playground__settings-label']}>Action</div>
                      <Paragraph>{selectedAssistant.action}</Paragraph>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <div className={styles['ai-assistant-playground__settings-label']}>System Prompt</div>
                      <Paragraph
                        ellipsis={{
                          rows: 3,
                          expandable: true,
                          symbol: 'Show more',
                        }}
                        className={styles['ai-assistant-playground__prompt-text']}
                      >
                        {selectedAssistant.systemPrompt}
                      </Paragraph>
                    </div>

                    <div className={styles['ai-assistant-playground__settings-section']}>
                      <div className={styles['ai-assistant-playground__settings-label']}>User Prompt Template</div>
                      <Paragraph
                        ellipsis={{
                          rows: 3,
                          expandable: true,
                          symbol: 'Show more',
                        }}
                        className={styles['ai-assistant-playground__prompt-text']}
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
    <Flex vertical className={styles['ai-assistant-playground']}>
      <AiAssistantsPlaygroundBreadcrumb />
      <Flex className={styles['ai-assistant-playground__layout']}>
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


const ChatBubble = ({ text, isUser }: { text: string; isUser: boolean }) => (
  <Card className={`${styles['chat-bubble']} ${isUser ? styles['chat-bubble--user'] : ''}`}>
    <div className={styles['chat-bubble__content']}>
      {text}
    </div>
  </Card>
)
