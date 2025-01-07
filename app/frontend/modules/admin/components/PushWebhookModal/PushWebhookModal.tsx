import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import {
  Form, Select, Space, Button, message,
} from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/foldgutter.css'
import cs from 'classnames'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  Webhook, WebhookTR, getWebhookPayload, PushWebhookReponseTR,
} from '~/modules/admin/modules/client/core/webhooks'
import {
  USER_ASSESSMENT_WEBHOOK_EVENTS, ParentResourceType, CAMPAIGN_WEBHOOK_EVENTS,
} from './constants'
import { fetchPossibleWebhookEvents, getCurrentWebhookEvents } from '~/modules/admin/modules/campaigns/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import styles from './PushWebhookModal.less'
import Payload from './payload.json'

const { I18n } = window
const { Option } = Select

export interface OwnProps {
  close(): void
  campaignId: number
  projectId: number
  webhook?: Webhook
  parentType: ParentResourceType
  parentId: number
  testMode: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWebhookPayload(campaignId: number, parentType: ParentResourceType, parentId: number, data: any): Promise<any>
}

const connecter = connect((state: RootState) => ({
  reportWebhookEvents: getCurrentWebhookEvents(state),
}),
{
  getWebhookPayload,
  fetchPossibleWebhookEvents,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export type Props = OwnProps & PropsFromRedux

const PushWebhookModal: React.FC<Props> = ({
  close, campaignId, projectId, parentId, parentType, getWebhookPayload, testMode,
  webhook, fetchPossibleWebhookEvents, reportWebhookEvents,
}) => {
  const [selectedWebhook, setSelectedWebhook] = useState<Pick<
    Webhook, 'id' | 'url' | 'description' | 'topics'
  > | null | undefined>(
    {
      id: '',
      url: '',
      description: '',
      topics: [],
    },
  )

  const [responseHeaders, setResponseHeaders] = useState({})
  const [responseBody, setResponseBody] = useState('')
  const [requestData, setRequestData] = useState('')
  const [responseVisible, setResponseVisible] = useState(false)

  const [form] = Form.useForm()

  const {
    data, fetch: fetchWebhooks, memberAction,
  } = useResources<Webhook>(
    'webhooks',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      responseType: WebhookTR,
      apiConfig: {
        filter: {
          active_true: 'true',
        },
      },
    },
  )

  const pushWebhookTest = values => memberAction({
    id: values.webhookId || webhook?.id,
    action: 'send_test',
    method: 'post',
    body: values,
    responseType: PushWebhookReponseTR,
  })

  const setSuccessReponse = (response) => {
    setResponseHeaders(response.headers)
    setResponseBody(response.body)
    setResponseVisible(true)
  }

  useEffect(() => {
    if (testMode) {
      setSelectedWebhook(webhook)
    } else {
      fetchWebhooks()
    }
  }, [])

  useEffect(() => {
    if (parentType === ParentResourceType.UserReport) {
      fetchPossibleWebhookEvents(campaignId, parentId)
    }
  }, [])

  const topics = (): string[] => {
    switch (parentType) {
      case ParentResourceType.UserAssessment:
        return _.intersection(selectedWebhook?.topics, USER_ASSESSMENT_WEBHOOK_EVENTS)
      case ParentResourceType.UserReport:
        return _.intersection(selectedWebhook?.topics, reportWebhookEvents)
      case ParentResourceType.CampaignUser:
        return _.intersection(selectedWebhook?.topics, CAMPAIGN_WEBHOOK_EVENTS)
      default:
        return webhook?.topics || []
    }
  }

  const handlefetchPayload = (value) => {
    const webhookId = form.getFieldValue('webhookId')
    const event_name = form.getFieldValue('event_name')

    if (testMode) {
      const payload = Payload[value]
      setRequestData(payload)
      form.setFieldsValue({
        payloadData: payload,
      })
    } else {
      getWebhookPayload(campaignId, parentType, parentId, {
        webhookId, event_name,
      }).then(({ response }) => {
        setRequestData(response)
        form.setFieldsValue({
          payloadData: response,
        })
      })
    }
  }

  const transformValues = values => ({
    ...values,
    payload: JSON.stringify(values.payloadData),
  })

  return (
    <>
      <ResourceFormModal
        resourceName="test_webhook"
        readableResourceName="Webhook"
        title={
          testMode ? I18n.t('user_assessments.modals.test_webhook.title')
            : I18n.t('user_assessments.modals.push_webhook.title')
        }
        submitButtonName={
          testMode ? I18n.t('user_assessments.modals.test_webhook.submit_button_name')
            : I18n.t('user_assessments.modals.push_webhook.submit_button_name')
        }
        close={close}
        manuallyClose
        storeManager={{ form }}
        scrollToFirstError
        modalProps={{ width: 620 }}
        request={{
          submit: pushWebhookTest,
        }}
        transformValues={transformValues}
        onSuccessfulSubmission={setSuccessReponse}
        hideOkButton={responseVisible}
      >
        {({ form }) => (
          <>
            {!testMode && !responseVisible && (
              <Form.Item
                name="webhookId"
                rules={[
                  { required: true },
                ]}
              >
                <Select
                  className={styles.eventName}
                  placeholder="webhook url"
                  onChange={(value) => {
                    setSelectedWebhook(_.find(data, { id: value }) || null)
                    setResponseHeaders({})
                    setResponseBody('')
                    form.setFieldsValue({
                      event_name: null,
                      payloadData: null,
                    })
                  }}
                >
                  {_.map(data, (webhook: Webhook) => (
                    <Option
                      key={webhook.id}
                      value={webhook.id}
                    >
                      {webhook.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {!responseVisible && topics().length > 0 && (
              <>
                <Form.Item
                  name="event_name"
                  className={styles.eventName}
                  rules={[
                    { required: true },
                  ]}
                >
                  <Select
                    placeholder={I18n.t('user_assessments.modals.push_test_webhook.event_name_placeholder')}
                    onChange={handlefetchPayload}
                  >
                    {_.map(topics() || [], (topic: string) => (
                      <Option
                        key={topic}
                        value={topic}
                      >
                        {_.startCase(topic)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}
            {!responseVisible && Object.keys(requestData).length > 0 && (
              <>
                <Form.Item
                  name="payloadData"
                >
                  <div className={cs(styles.tabContent, 'pb-2')}>
                    <CodeMirror
                      value={JSON.stringify(requestData, null, 2)}
                      options={{
                        mode: {
                          name: 'javascript',
                          json: true,
                        },
                        readOnly: true,
                        lineWrapping: true,
                      }}
                    />
                  </div>
                </Form.Item>
                <CopyToClipboard
                  text={JSON.stringify(requestData)}
                  onCopy={() => message.info(
                    I18n.t('user_assessments.modals.push_test_webhook.copy_request_data_success'),
                  )}
                >
                  <Button
                    type="text"
                    className={responseVisible ? styles.hideButton : styles.requestDataCopyButton}
                    icon={<CopyOutlined />}
                  />
                </CopyToClipboard>
              </>
            )}
            <Space direction="vertical" className="w-100">
              {responseVisible && (
                <>
                  <div className={cs(styles.tabContent, 'pb-2')}>
                    <p>{I18n.t('user_assessments.modals.push_test_webhook.response_header_title')}</p>
                    <CodeMirror
                      value={JSON.stringify(responseHeaders, null, 2)}
                      options={{
                        mode: {
                          name: 'javascript',
                          json: true,
                        },
                        readOnly: true,
                        lineWrapping: true,
                      }}
                    />
                  </div>
                  <CopyToClipboard
                    text={JSON.stringify(responseHeaders, null, 2)}
                    onCopy={() => message.info(
                      I18n.t('user_assessments.modals.push_test_webhook.copy_response_headers_success'),
                    )}
                  >
                    <Button
                      type="text"
                      className={styles.responseHeadersCopyButton}
                      icon={<CopyOutlined />}
                    />
                  </CopyToClipboard>
                </>
              )}
              {responseVisible && (
                <>
                  <div className={cs(styles.tabContent, 'pb-2')}>
                    <p>{I18n.t('user_assessments.modals.push_test_webhook.response_body_title')}</p>
                    <CodeMirror
                      value={responseBody}
                      options={{
                        mode: {
                          name: 'javascript',
                          json: true,
                        },
                        readOnly: true,
                        lineWrapping: true,
                      }}
                    />
                  </div>
                  <CopyToClipboard
                    text={responseBody}
                    onCopy={() => message.info(
                      I18n.t('user_assessments.modals.push_test_webhook.copy_response_body_success'),
                    )}
                  >
                    <Button
                      type="text"
                      className={styles.responseBodyCopyButton}
                      icon={<CopyOutlined />}
                    />
                  </CopyToClipboard>
                </>
              )}
            </Space>
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
export default connecter(PushWebhookModal)
