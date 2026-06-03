import {
  Button, Flex, Space, Typography, Popconfirm,
  message,
} from 'antd'
import {
  Attachments, Prompts,
} from '@ant-design/x'
import * as t from 'io-ts'
import humps from 'humps'

import { PageHeader } from '@ant-design/pro-components'
import {
  FC, useEffect, useRef, useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  CloudUploadOutlined, InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { DirectionalNavigateBackIcon } from '~/glint'
import { setUserIdpPlanStatus } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { AIAssistantLayout } from '../AIAssistantLayout'
import { AIIDPLoader } from './AIIDPLoader'
import styles from './AIChat.less'
import { RecordingProvider } from '~/context/RecordingContext'
import { ChatCompose } from './ChatCompose'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import BubbleTypes from './bubbles'
import { ASSISTANT_FAILURE_FALLBACK_CONTENT, MAXIMUM_FILE_SIZE_MB } from './constants'
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
  aiAssistedIdpHasDocumentAnalysis?: boolean
}

export const Bubble: FC<BubbleProps> = ({
  content, onAction, isCurrent, status, aiAssistedIdpHasDocumentAnalysis,
}) => {
  const {
    component, message, data, role, error,
  } = content

  const isUploadedFileString = role === 'user'
  && typeof message === 'string'
  && /^Uploaded file .*?\.[A-Za-z0-9]+$/i.test(message.trim())

  let bubbleType: string

  if (isUploadedFileString) {
    bubbleType = 'UserDocument'
  } else {
    bubbleType = role === 'user' ? 'UserMessage' : 'AssistantMessage'
  }
  const Bubble = BubbleTypes[component || bubbleType] || BubbleTypes.AssistantMessage

  return (
    <Bubble
      message={message}
      data={data}
      onAction={onAction}
      isCurrent={isCurrent}
      status={status}
      error={error}
      aiAssistedIdpHasDocumentAnalysis={aiAssistedIdpHasDocumentAnalysis}
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

  const aiAssistedIdpHasDocumentAnalysis = useSelector(
    (state: RootState) => state.config.idp.aiAssistedIdpHasDocumentAnalysis,
  )
  const showChatInstructions = useSelector((state: RootState) => state.campaigns.idp.showChatInstructions)
  const skillGapReportAvailable = useSelector((state: RootState) => state.campaigns.idp.skillGapReportAvailable)


  const changeValue = (value: string) => {
    setUserPrompt(value)
  }


  const fetchMessages = () => dispatch({
    type: 'FETCH/AI_CHAT_MESSAGES',
    request:
    {
      method: 'get',
      url: '/ai_assisted_idp_chats',
    },
  }) as unknown as Promise<{ response: AIAssistedIDPSession }>

  const { startDictation, stopDictation } = useSpeechToText({
    value: userPrompt,
    onChange: changeValue,
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
    numberOfTimesToPoll: 60,
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
    const message = msg.role === 'assistant'
      ? parseAssistantMessage(content || { message: msg.content }) : { message: msg.content }
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

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: I18n.t('validations.file_upload.WrongFileType', { allowedFileTypes: '[PDF]' }),
      }
    }

    const maxSize = MAXIMUM_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: I18n.t('validations.file_upload.EntityTooLarge', { maxFileSize: MAXIMUM_FILE_SIZE_MB }),
      }
    }

    return { isValid: true }
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
      if (lastMessage.component === 'AssistantMessage') {
        setStatus('chat')
      }
      if (lastMessage.component === 'RequestDocument' && aiAssistedIdpHasDocumentAnalysis) {
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
      const isUserMessage = lastMessage.role === 'user' || lastMessage.component === 'UserMessage'
      if (status === 'completed' && !isUserMessage) {
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
      const { messages: fetchedMessages, error: aiSessionError, status: sessionStatus } = response
      const validMessages = fetchedMessages.filter(msg => msg.content !== null)
      const messages = parseMessages(validMessages)

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

      const lastUserMessage = [...validMessages].reverse().find(msg => msg.role === 'user')
      const proceedWithPlanMessage = I18n.t('enduser.ai_idp_assistant_response_yes_proceed_with_plan_creation')
      const isPlanCreationInProgress = sessionStatus === 'in_progress'
        && lastUserMessage?.content === proceedWithPlanMessage

      if (isPlanCreationInProgress) {
        setStatus('completed')
        return
      }

      scrollToBottom(false)
    }).catch((error) => {
      message.error(error || I18n.t('ai.errors.generic'))
      setRequestProcessing(false)
      setMessages([])
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
      addUserMessage(I18n.t('enduser.ai_idp_assistant_response_yes_proceed_with_plan_creation'))
      setStatus('completed')
    }
    if (action === 'changeAnswers') {
      addUserMessage(I18n.t('enduser.ai_idp_assistant_response_no'))
      // setMessages(prev => [...prev, { component: 'RetakeSteps' }])
    }

    if (action === 'retakeChat') {
      handleReset()
    }

    if (action === 'retakeDocument') {
      addUserMessage(I18n.t('enduser.ai_idp_assistant_response_upload_different_document'))
    }
  }

  const renderUpload = () => (
    <Attachments
      className={styles.upload}
      classNames={{ list: styles.uploadList, placeholder: styles.uploadList }}
      beforeUpload={() => false}
      accept=".pdf"
      items={[]}
      maxCount={1}
      disabled={requestProcessing}
      onChange={(info) => {
        const validation = validateFile(info.file)
        if (!validation.isValid) {
          message.error(validation.error)
          return
        }
        uploadDocument(info.file)
      }}
      placeholder={type => (type === 'drop'
        ? {
          title: I18n.t('idp.ai.upload.drop'),
        }
        : {
          icon: <CloudUploadOutlined />,
          title: I18n.t('idp.ai.upload.title'),
          description: I18n.t('idp.ai.upload.description', { maxFileSize: MAXIMUM_FILE_SIZE_MB }),
        })
      }
    />
  )

  const handlePrev = () => {
    if (showChatInstructions) {
      navigate('/idp/ai_assistant/chat_instructions')
    } else if (skillGapReportAvailable) {
      navigate('/idp/ai_assistant/skill_gap_report')
    } else {
      navigate('/idp/ai_assistant/start')
    }
  }

  const showResetChat = (messages.length > 1 && !resetInProgress)
                          || (messages.length > 0 && messages[messages.length - 1].error)

  if (status === 'completed') {
    return (
      <AIAssistantLayout>
        <AIIDPLoader />
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
                  onClick={handlePrev}
                >
                  <DirectionalNavigateBackIcon className={styles.backIcon} />
                </Button>
                <Typography.Text strong style={{ lineHeight: '2rem' }}>
                  {I18n.t('enduser.lighthouse_assistant')}
                </Typography.Text>
              </Space>
            )}
            extra={(
              showResetChat ? (
                <Popconfirm
                  disabled={requestProcessing}
                  styles={{ root: { zIndex: 9999 } }}
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
          <Flex gap="middle" vertical className={styles.messages} style={{ paddingInlineEnd: 16 }}>
            {messages.map((message, index) => (
              <Bubble
                key={index}
                content={message}
                status={status}
                isCurrent={index === messages.length - 1}
                onAction={onAction}
                aiAssistedIdpHasDocumentAnalysis={aiAssistedIdpHasDocumentAnalysis}
              />
            ))}
            {requestProcessing
              && (
                <Bubble
                  content={{ component: 'BotLoading' }}
                  aiAssistedIdpHasDocumentAnalysis={aiAssistedIdpHasDocumentAnalysis}
                />
              )}
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
          {status === 'chat' && (
            <ChatCompose
              className={styles.compose}
              value={userPrompt}
              onChange={changeValue}
              onSubmit={(value) => {
                addUserMessage(value)
                setUserPrompt('')
              }}
              disabled={requestProcessing}
              recording={recording}
              onRecordingChange={setRecording}
              startDictation={startDictation}
              stopDictation={stopDictation}
            />
          )}
          {status === 'document_upload' && aiAssistedIdpHasDocumentAnalysis && renderUpload()}
          <Flex align="center" justify="center" gap={8} style={{ marginTop: 4 }}>
            <InfoCircleOutlined style={{ fontSize: '12px' }} />
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {I18n.t('shared.idp_ai_assistant_disclaimer')}
            </Typography.Text>
          </Flex>
        </Flex>
      </AIAssistantLayout>
    </RecordingProvider>
  )
}
