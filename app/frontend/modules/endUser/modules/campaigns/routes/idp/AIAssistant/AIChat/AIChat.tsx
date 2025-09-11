import {
  Button, Flex, Space, Typography,
} from 'antd'
import {
  Attachments, Sender, Welcome, Prompts,
} from '@ant-design/x'
import Icon, {
  CloudUploadOutlined, LoadingOutlined,
} from '@ant-design/icons'
import * as t from 'io-ts'

import { PageHeader } from '@ant-design/pro-layout'
import {
  FC, useEffect, useRef, useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { DirectionalNavigateBackIcon } from '~/glint'
import { AIAssistantLayout } from '../AIAssistantLayout'
import styles from './AIChat.less'
import { RecordingProvider } from '~/context/RecordingContext'
import Lighthouse from './assets/LighthouseIcon.svg?react'
import { BotIcon } from './bubbles/BotIcon'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import BubbleTypes from './bubbles'

const { I18n } = window

interface BubbleProps {
  content: {
    component?: string,
    message?: string | { file: File }
    data?: { [key: string]: string }
  },
  onAction?: (action: string) => void,
  isCurrent?: boolean,
  status?: string
}

export const Bubble: FC<BubbleProps> = ({
  content, onAction, isCurrent, status,
}) => {
  const { component, message, data } = content
  const Bubble = BubbleTypes[component || 'AssistantMessage'] || BubbleTypes.AssistantMessage
  return <Bubble message={message} data={data} onAction={onAction} isCurrent={isCurrent} status={status} />
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
  const [messages, setMessages] = useState<{
    component: string, suggestions?: string[], message?: string | { file: File }
  }[]>([])
  const [userPrompt, setUserPrompt] = useState('')
  const [requestProcessing, setRequestProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const listBottom = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, { component: 'UserMessage', message }])
    sendMessage(message)
    setSuggestions([])
  }

  const askRequest = useAsyncRequestResponse({
    url: '/ai_assisted_idp_chats/ask',
    data: {},
    pollingInterval: 3,
    numberOfTimesToPoll: 40,
    responseType: AsyncChatTR,
  })

  const uploadRequest = useAsyncRequestResponse({
    url: '/ai_assisted_idp_chats/upload_document',
    data: {},
    pollingInterval: 3,
    numberOfTimesToPoll: 40,
    responseType: AsyncChatTR,
  })

  const sendMessage = async (message) => {
    setRequestProcessing(true)
    try {
      const response = await askRequest.makeAsyncRequest({ message })
      const { content } = response.responseData

      setMessages(prev => [...prev, {
        component: content.component,
        message: content.message,
        data: content.data,
        suggestions: content.suggestions || [],
      }])
    } finally {
      setRequestProcessing(false)
    }
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

      setMessages(prev => [...prev, {
        component: content.component,
        message: content.message,
        data: content.data,
        suggestions: content.suggestions || [],
      }])
    } finally {
      setRequestProcessing(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      listBottom.current?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  useEffect(() => {
    scrollToBottom()
    if (messages.length > 0) {
      if (messages[messages.length - 1].component === 'RequestDocument') {
        setStatus('document_upload')
      }
      if (messages[messages.length - 1].component === 'Summary') {
        setStatus('confirmation')
      }
      if (messages[messages.length - 1].suggestions) {
        setSuggestions(messages[messages.length - 1].suggestions || [])
      }
      if (messages[messages.length - 1].component === 'IdpCreated') {
        navigate('/idp/my_plan')
      }
    }
  }, [messages])

  useEffect(() => {
    askRequest.startPolling()?.then(({ responseData: { content } }) => {
      setMessages(prev => [...prev, {
        component: content.component,
        message: content.message,
        suggestions: content.suggestions || [],
      }])
    })

    return () => {
      setMessages([])
      setStatus('chat')
    }
  }, [])

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
      addUserMessage('Yes')
      setStatus('completed')
    }
    if (action === 'changeAnswers') {
      addUserMessage('No')
      // setMessages(prev => [...prev, { component: 'RetakeSteps' }])
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
              <Space>
                <Button
                  size="small"
                  type="text"
                  aria-label={I18n.t('common.actions.go_back')}
                >
                  <DirectionalNavigateBackIcon className={styles.backIcon} />
                  {I18n.t('common.actions.go_back')}
                </Button>
              </Space>
            )}
          />
          <Flex gap="middle" vertical className={styles.messages}>
            <Welcome
              variant="borderless"
              icon={<BotIcon size={50} />}
              title={I18n.t('idp.ai.welcome.title')}
              description={I18n.t('idp.ai.welcome.text')}
            />
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
