import {
  Button, Flex, Space, Typography, Popconfirm,
} from 'antd'
import {
  Attachments, Sender, Prompts,
} from '@ant-design/x'
import Icon, {
  CloudUploadOutlined, LoadingOutlined,
} from '@ant-design/icons'
import * as t from 'io-ts'
import humps from 'humps'

import { PageHeader } from '@ant-design/pro-layout'
import {
  FC, useEffect, useRef, useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { DirectionalNavigateBackIcon } from '~/glint'
import { setUserIdpPlanStatus } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import { AIAssistantLayout } from '../AIAssistantLayout'
import styles from './AIChat.less'
import { RecordingProvider } from '~/context/RecordingContext'
import Lighthouse from './assets/LighthouseIcon.svg?react'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import BubbleTypes from './bubbles'
import { ASSISTANT_FAILURE_FALLBACK_CONTENT } from './constants'
import { AWS_SPEECH_TO_TEXT_URL } from '~/modules/survey/core/preview/FlowProcessor/consts'
import { useSpeechToText } from '~/hooks/useSpeechToText'

const { I18n } = window

export type AIChatMessageContent = {
  component?: string,
  message: string | { file: File }
  data?: {
  documentSummary?: string
  chatSummary?: string
  }
  role?: string
  suggestions?: string[]
  error?: string
}

export type AIChatMessage = {
  id: number
  role: string
  content: string
  createdAt: string
}

export type AIAssistedIDPSession = {
  error?: string | null
  messages: AIChatMessage[]
  meta?: Record<string, unknown> | null
  checkpoint?: string | null
  status: string
}

interface BubbleProps {
  content: {
    component?: string,
    message?: string | { file: File }
    data?: { [key: string]: string }
    role?: string
    error?: string
  },
  onAction?: (action: string) => void,
  isCurrent?: boolean,
  status?: string
}

export const Bubble: FC<BubbleProps> = ({
  content, onAction, isCurrent, status,
}) => {
  const {
    component, message, data, role, error,
  } = content

  const bubbleType = role === 'user' ? 'UserMessage' : 'AssistantMessage'
  const Bubble = BubbleTypes[component || bubbleType] || BubbleTypes.AssistantMessage

  return (
    <Bubble
      message={message}
      data={data}
      onAction={onAction}
      isCurrent={isCurrent}
      status={status}
      error={error}
    />
  )
}

export const AsyncChatTR = t.type({
  status: t.string,
  response: t.type({
    asyncRequestUuid: t.string,
    processingStatus: t.string,
    responseType: t.string,
    responseData: t.union([
      t.string,
      t.null,
      t.type({}),
    ]),
  }),
})

export const AIChat = () => {
  const [status, setStatus] = useState<'chat' | 'document_upload' | 'interview' | 'confirmation' | 'completed'>('chat')
  const [messages, setMessages] = useState<AIChatMessageContent[]>([])
  const [userPrompt, setUserPrompt] = useState('')
  const [requestProcessing, setRequestProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const listBottom = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [recording, setRecording] = useState(false)
  const [resetInProgress, setResetInProgress] = useState(false)

  const changeValue = (value:string) => {
    setUserPrompt(value)
  }

  const fetchAwsSpeechTextPresignedUrl = () => dispatch({
    type: AWS_SPEECH_TO_TEXT_URL,
    request:
    {
      method: 'get',
      url: '/transcribe/pre_sign_url',
    },
  }) as unknown as Promise<{ response: { url: string } }>

  const fetchMessages = () => dispatch({
    type: 'FETCH/AI_CHAT_MESSAGES',
    request:
    {
      method: 'get',
      url: '/ai_assisted_idp_chats',
    },
  }) as unknown as Promise<{ response: AIAssistedIDPSession }>

  const { startDictation, stopDictation } = useSpeechToText({
    value: userPrompt, onChange: changeValue, fetchPresignUrl: fetchAwsSpeechTextPresignedUrl,
  })

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, { component: 'UserMessage', message }])
    sendMessage(message)
    setSuggestions([])
  }

  const askRequest = useAsyncRequestResponse({
    url: '/ai_assisted_idp_chats/ask',
    data: {},
    pollingInterval: 3,
    numberOfTimesToPoll: 30,
    responseType: AsyncChatTR,
  })

  const uploadRequest = useAsyncRequestResponse({
    url: '/ai_assisted_idp_chats/upload_document',
    data: {},
    pollingInterval: 3,
    numberOfTimesToPoll: 60,
    responseType: AsyncChatTR,
  })

  const resetRequest = useAsyncRequestResponse({
    url: '/ai_assisted_idp_chats/reset',
    data: {},
    pollingInterval: 3,
    numberOfTimesToPoll: 30,
    responseType: AsyncChatTR,
    onFailure: () => {
      setRequestProcessing(false)
      setResetInProgress(false)
    },
  })


  const handleErrorResponse = (content) => {
    // Add error attribute to last message
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages]

      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          error: content.message || I18n.t('ai.errors.generic'),
        }
      } else {
        updatedMessages.push({
          component: 'AssistantMessage',
          message: I18n.t('ai.errors.generic'),
          error: content.message || I18n.t('ai.errors.generic'),
        })
      }
      return updatedMessages
    })
  }

  const cancelDictation = () => {
    if (recording) {
      stopDictation()
      setRecording(false)
    }
  }

  const sendMessage = async (message) => {
    setRequestProcessing(true)
    try {
      cancelDictation()
      const response = await askRequest.makeAsyncRequest({ message })
      const { content } = response.responseData

      const isErrorResponse = typeof content === 'object' && content?.component === 'Error'

      // When we receive an error response, it means the last user message was not processed correctly
      // So we add the error message to the last user message bubble
      if (isErrorResponse) {
        return handleErrorResponse(content)
      }

      setMessages(prev => [...prev, parseAssistantMessage(content)])
    } finally {
      setRequestProcessing(false)
      if (status === 'completed') {
        setStatus('confirmation')
      }
    }
  }

  const parseContent = (content) => {
    try {
      return humps.camelizeKeys(JSON.parse(content.split('\n')[0]))
    } catch {
      return null
    }
  }

  const parseMessages = messages => messages.map((msg) => {
    const content = parseContent(msg.content)
    const message = parseAssistantMessage(content || { message: msg.content })
    return ({
      ...message,
      role: msg.role,
    })
  })

  const parseAssistantMessage = (content) => {
    // We need to ensure that even if for some reason content is not object, we let the user re-try
    // Using ASSISTANT_FAILURE_FALLBACK_CONTENT to handle such cases
    const messageContent = (typeof content === 'object')
      ? {
        message: content.message,
        component: content.component,
        suggestions: (content.component !== 'AssistantMessage') ? [] : content.suggestions || [],
        data: content.data || {},
      }
      : parseContent(content) || ASSISTANT_FAILURE_FALLBACK_CONTENT

    return messageContent
  }

  const uploadDocument = async (file) => {
    setRequestProcessing(true)
    setSuggestions([])
    setMessages(prev => [...prev, {
      component: 'UserDocument',
      message: {
        file,
      },
    }])
    try {
      const formData = new FormData()
      formData.append('file', file, file.name)
      const response = await uploadRequest.makeAsyncRequest(formData)
      const { content } = response.responseData

      setMessages(prev => [...prev, parseAssistantMessage(content)])
    } finally {
      setRequestProcessing(false)
    }
  }

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      listBottom.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }, 200)
  }

  useEffect(() => {
    scrollToBottom()
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.component === 'RequestDocument') {
        setStatus('document_upload')
      }
      if (lastMessage.component === 'Summary') {
        setStatus('confirmation')
      }
      if (lastMessage.suggestions) {
        setSuggestions(lastMessage.suggestions || [])
      }
      if (lastMessage.component === 'IdpCreated') {
        // Update the status in Redux store to draft before navigating
        dispatch(setUserIdpPlanStatus(USER_IDP_PLAN_STATUS.DRAFT))
        navigate('/idp/my_plan')
        return
      }
      if (status === 'completed' && lastMessage.component !== 'UserMessage') {
        setStatus('confirmation')
      }
    }
  }, [messages])

  useEffect(() => {
    askRequest.startPolling()?.then((response) => {
      if (response) {
        const { responseData: { content } } = response
        setMessages(prev => [...prev, parseAssistantMessage(content)])
      }
    })
    if (resetRequest.startPolling()?.then((response) => {
      if (response) {
        const { responseData: { content } } = response
        if (content.messages) {
          setMessages(() => parseMessages(content.messages))
        }
        if (content?.component === 'Error') {
          handleErrorResponse(content)
        }
      }
      setRequestProcessing(false)
      setResetInProgress(false)
    })) {
      setRequestProcessing(true)
      setResetInProgress(true)
      return
    }
    setRequestProcessing(true)
    fetchMessages().then(({ response }) => {
      const { messages: fetchedMessages, error: aiSessionError } = response
      const messages = fetchedMessages.map((msg) => {
        const content = parseContent(msg.content)
        const message = parseAssistantMessage(content || { message: msg.content })
        return ({
          // ...(content || { message: msg.content }),
          ...message,
          role: msg.role,
        })
      })

      if (aiSessionError) {
        if (messages.length > 0) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            error: aiSessionError,
          }
        } else {
          messages.push({
            component: 'AssistantMessage',
            message: I18n.t('ai.errors.generic'),
            error: aiSessionError,
          })
        }
      }

      setRequestProcessing(false)
      setMessages(messages)
      scrollToBottom(false)
    })

    return () => {
      setMessages([])
      setStatus('chat')
    }
  }, [])

  const handleReset = async () => {
    cancelDictation()
    setRequestProcessing(true)
    setResetInProgress(true)
    setMessages([])
    setStatus('chat')
    setSuggestions([])
    try {
      const response = await resetRequest.makeAsyncRequest()
      const { content } = response.responseData
      const isErrorResponse = (typeof content === 'object' && content?.component === 'Error') || content.error
      if (isErrorResponse) {
        return handleErrorResponse(content)
      }
      const messages = parseMessages(content.messages)
      setMessages(() => messages)
    } finally {
      setRequestProcessing(false)
      setResetInProgress(false)
      if (status === 'completed') {
        setStatus('confirmation')
      }
    }
  }

  const onAction = (action) => {
    if (action === 'scroll') {
      scrollToBottom()
    }
    if (action === 'yes') {
      addUserMessage('Yes')
      setStatus('interview')
    }
    // if (action === 'nextQuestion') {
    //   addUserMessage('Next question')
    // }
    // if (action === 'finishInterview') {
    //   addUserMessage('Finish interview')
    // }
    if (action === 'complete') {
      addUserMessage('Yes, proceed with plan creation.')
      setStatus('completed')
    }
    if (action === 'changeAnswers') {
      addUserMessage('No')
      // setMessages(prev => [...prev, { component: 'RetakeSteps' }])
    }

    if (action === 'retakeChat') {
      handleReset()
    }

    if (action === 'retakeDocument') {
      addUserMessage('I want to upload a different document.')
    }
  }

  const renderCompose = () => (
    <Sender
      className={styles.compose}
      placeholder={I18n.t('idp.ai.compose.placeholder')}
      value={userPrompt}
      onChange={value => setUserPrompt(value)}
      disabled={requestProcessing}
      onSubmit={(value) => {
        addUserMessage(value)
        setUserPrompt('')
      }}
      allowSpeech={{
        // When setting `recording`, the built-in speech recognition feature will be disabled
        recording,
        onRecordingChange: (nextRecording) => {
          setRecording(nextRecording)
          if (nextRecording) {
            startDictation()
          } else {
            stopDictation()
          }
        },
      }}
      autoSize={{ minRows: 3, maxRows: 6 }}
    />
  )

  const renderUpload = () => (
    <Attachments
      className={styles.upload}
      classNames={{ list: styles.uploadList, placeholder: styles.uploadList }}
      beforeUpload={() => false}
      items={[]}
      disabled={requestProcessing}
      onChange={(info) => {
        uploadDocument(info.file)
      }}
      placeholder={type => (type === 'drop'
        ? {
          title: I18n.t('idp.ai.upload.drop'),
        }
        : {
          icon: <CloudUploadOutlined />,
          title: I18n.t('idp.ai.upload.title'),
          description: I18n.t('idp.ai.upload.description'),
        })
      }
    />
  )

  if (status === 'completed') {
    return (
      <AIAssistantLayout>
        <Flex vertical align="center" justify="center" className={styles.chatCompleted}>
          <div className={styles.spinner}>
            <LoadingOutlined style={{ fontSize: 120, color: '#ccc' }} />
            <Icon component={Lighthouse} className={styles.lighthouse} />
          </div>
          <Typography.Title level={3} style={{ marginTop: 20 }}>
            {I18n.t('idp.ai.finishing.title')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {I18n.t('idp.ai.finishing.hint')}
          </Typography.Text>
        </Flex>
      </AIAssistantLayout>
    )
  }

  return (
    <RecordingProvider>
      <AIAssistantLayout>
        <Flex vertical className={styles.chatContainer}>
          <PageHeader
            className={styles.header}
            backIcon={false}
            title={(
              <Space align="center">
                <Button
                  size="small"
                  type="text"
                  aria-label={I18n.t('common.actions.go_back')}
                  onClick={() => navigate('/idp/ai_assistant/start')}
                >
                  <DirectionalNavigateBackIcon className={styles.backIcon} />
                </Button>
                <Typography.Text strong style={{ lineHeight: '2rem' }}>
                  {I18n.t('enduser.lighthouse_assistant')}
                </Typography.Text>
              </Space>
            )}
            extra={(
              messages.length > 1 && !resetInProgress ? (
                <Popconfirm
                  disabled={requestProcessing}
                  overlayStyle={{ zIndex: 9999 }}
                  title={I18n.t('idp.ai.reset_confirmation')}
                  onConfirm={() => handleReset()}
                  okText={I18n.t('common.actions.yes')}
                  cancelText={I18n.t('common.actions.no')}
                >
                  <Button
                    type="text"
                    disabled={requestProcessing}
                    danger
                  >
                    {I18n.t('idp.ai.reset_chat')}
                  </Button>
                </Popconfirm>
              ) : null
            )}
          />
          <Flex gap="middle" vertical className={styles.messages}>
            {messages.map((message, index) => (
              <Bubble
                key={index}
                content={message}
                status={status}
                isCurrent={index === messages.length - 1}
                onAction={onAction}
              />
            ))}
            {requestProcessing && <Bubble content={{ component: 'BotLoading' }} />}
            <div style={{ marginBottom: 20 }} ref={listBottom} />
          </Flex>
          <Prompts
            onItemClick={info => addUserMessage(info.data.description)}
            styles={{
              list: { paddingBottom: 10 },
            }}
            classNames={{ item: styles.promptItem }}
            items={suggestions.map((item, index) => ({ key: index.toString(), description: item }))}
          />
          {status === 'chat' && renderCompose()}
          {status === 'document_upload' && renderUpload()}
        </Flex>
      </AIAssistantLayout>
    </RecordingProvider>
  )
}
