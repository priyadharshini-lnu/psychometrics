import React, { useState } from 'react'
import {
  Form, Button, Select, message,
} from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/foldgutter.css'
import cs from 'classnames'
import _ from 'lodash'
import styles from './styles.less'
import { Webhook } from '~/modules/admin/modules/client/core/webhooks'
import { useResources } from '~/hooks/useResources'
import ResourceFormModal from '~/components/ResourceFormModal'
import Payload from '../payload.json'

const { I18n } = window
const { Option } = Select

interface Props {
  close(): void
  webhook: Webhook
}
export const TestWebhookModal: React.FC<Props> = ({
  close, webhook,
}) => {
  const [payloadJson, setPayloadJson] = useState('')

  const {
    memberAction,
  } = useResources<Webook>(
    'webhooks',
    {
      basePath: `projects/${webhook.projectId}`,
      trackUrl: true,
      responseType: {},
    },
  )

  const sendTest = (values: Webhook) => memberAction({
    id: webhook.id,
    action: 'send_test',
    method: 'post',
    body: values,
  })

  return (
    <>
      <ResourceFormModal
        resourceName="test_webhook"
        readableResourceName="Webhook"
        title={I18n.t('administration.project_tabs.webhooks.send_test.title')}
        submitButtonName={I18n.t('administration.project_tabs.webhooks.send_test.submit_button')}
        showSuccessMessages
        close={close}
        scrollToFirstError
        modalProps={{ width: 620 }}
        request={{
          submit: sendTest,
        }}
      >
        {({ form }) => (
          <>
            <Form.Item
              name="event_name"
              rules={[{ required: true }]}
            >
              <Select
                style={{ width: '100%' }}
                placeholder={
                  I18n.t('administration.project_tabs.webhooks.send_test.event_dropdown.placeholder')
                }
                showSearch
                optionFilterProp="label"
                filterOption
                onChange={(value) => {
                  const data = JSON.stringify(Payload[value], undefined, 2)
                  setPayloadJson(data)
                  form.setFieldsValue({
                    payloadData: data,
                  })
                }}
              >
                {_.map(webhook.topics || [], (topic: string) => (
                  <Option
                    label={topic}
                    key={topic}
                    value={topic}
                  >
                    {topic}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {payloadJson && (
              <Form.Item
                name="payloadData"
              >
                <div className={cs(styles.tabContent, 'pb-2')}>
                  <CodeMirror
                    value={payloadJson}
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
            )}
            {payloadJson && (
              <CopyToClipboard
                text={payloadJson}
                onCopy={() => message.info(
                  I18n.t('administration.project_tabs.webhooks.send_test.copy_payload_success'),
                )}
              >
                <Button
                  type="text"
                  className={styles.copyButton}
                  icon={<CopyOutlined />}
                />
              </CopyToClipboard>
            )}
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
