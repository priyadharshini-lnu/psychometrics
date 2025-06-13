import React from 'react'
import {
  Form, Input, Select,
} from 'antd'
import { useSelector } from 'react-redux'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { getAvailableAiProviders } from '~/core/config'
import { AI_ACTIONS, AI_PROVIDERS } from '~/modules/admin/modules/AiAssitant/core/constants'


type Props = {
  close(): void
  aiAssistant?: AiAssistant
}

const { I18n } = window


export const AiAssistantFormModal: React.FC<Props> = ({ close, aiAssistant }) => {
  const { resource } = useResourceContext<AiAssistant>()
  const [form] = Form.useForm()
  const availableAiProviders = useSelector(getAvailableAiProviders)

  return (
    <ResourceFormModal
      resourceName="assistants"
      resource={aiAssistant}
      readableResourceName={I18n.t('administration.ai_assistants.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.ai_assistants.form.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('administration.ai_assistants.form.description')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="providerId"
            label={I18n.t('administration.ai_assistants.form.provider')}
            rules={[{ required: true }]}
          >
            <Select>
              {availableAiProviders.map(provider => (
                <Select.Option key={provider} value={provider}>
                  {AI_PROVIDERS[provider].name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="action"
            label={I18n.t('administration.ai_assistants.form.action')}
            rules={[{ required: true }]}
          >
            <Select>
              {Object.values(AI_ACTIONS).map(action => (
                <Select.Option key={action.id} value={action.id}>
                  {action.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="systemPrompt"
            label={I18n.t('administration.ai_assistants.form.system_prompt')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="userPrompt"
            label={I18n.t('administration.ai_assistants.form.user_prompt')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
