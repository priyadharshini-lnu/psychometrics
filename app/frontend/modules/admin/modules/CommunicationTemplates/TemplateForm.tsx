import React, { useState } from 'react'
import {
  Button, Form, Input, Select, Space,
} from 'antd'
import { Provider } from 'react-redux'
import ResourceFormModal from '~/components/ResourceFormModal'
import EmailEditor from '~/components/EmailEditor'
import Modals from '~/modules/admin/components/Modals'
import store from '~/modules/admin/store'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { SubjectPipedTextButton } from '~/modules/admin/modules/CommunicationForm/SubjectPipedTextButton'
import { PipedTextModal } from '~/modules/admin/modules/CommunicationForm/PipedTextModal'
import '~/modules/admin/modules/CommunicationForm/pipedText'
import { CommunicationTemplate } from './core/communicationTemplates'
import { TranslationsModal } from './TranslationsModal'
import {
  KINDS, STATUSES, TemplateLevel, TemplateScope,
} from './constants'

const { I18n } = window

interface Props {
  close(): void
  level: TemplateLevel
  scope: TemplateScope
  template?: CommunicationTemplate
  sourceTemplate?: CommunicationTemplate
}

export const TemplateForm: React.FC<Props> = ({
  close, level, scope, template, sourceTemplate,
}) => {
  const { resource } = useResourceContext<CommunicationTemplate>()
  const [form] = Form.useForm()
  const seed = template || sourceTemplate
  const [body, setBody] = useState<string>(seed?.body || '')
  const [showTranslations, setShowTranslations] = useState(false)

  const kind = Form.useWatch('kind', form) || seed?.kind

  const handleBodyChange = (value: string) => {
    setBody(value)
    form.setFieldValue('body', value)
  }

  const insertSubjectText = (value: string) => {
    const current = form.getFieldValue('subject') || ''
    form.setFieldValue('subject', `${current}${value}`)
  }

  const buildRelationships = (values: Record<string, unknown>) => {
    const payload: Record<string, unknown> = { ...values, level }
    if (level === 'client') payload.clientId = scope.clientId
    if (level === 'project') payload.projectId = scope.projectId
    if (level === 'campaign') payload.campaignId = scope.campaignId
    if (sourceTemplate) payload.inheritsFromId = sourceTemplate.id
    return payload
  }

  return (
    <Provider store={store}>
      <ResourceFormModal
        resourceName="communication_templates"
        readableResourceName={I18n.t('admin.communication_template')}
        resource={template}
        showSuccessMessages
        close={close}
        storeManager={{ form }}
        scrollToFirstError
        modalProps={{ width: 720, maskClosable: false }}
        formProps={{
          initialValues: {
            name: seed?.name || '',
            kind: seed?.kind,
            subject: seed?.subject || '',
            status: template?.status || 'draft',
          },
        }}
        transformValues={buildRelationships}
        onSuccessfulSubmission={() => resource.fetch()}
        request={{
          createResource: resource.createResource,
          updateResource: resource.updateResource,
        }}
      >
        {() => (
          <>
            <Form.Item
              name="name"
              label={I18n.t('admin.communication_template_name_label')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="kind"
              label={I18n.t('admin.communication_template_kind_label')}
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={KINDS.map(kindOption => ({
                  value: kindOption,
                  label: I18n.t(`administration.communications.form.${kindOption}`),
                }))}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label={I18n.t('admin.communication_template_status_label')}
              rules={[{ required: true }]}
            >
              <Select
                options={STATUSES.map(statusOption => ({
                  value: statusOption,
                  label: I18n.t(`admin.communication_template_status_${statusOption}`),
                }))}
              />
            </Form.Item>

            <Form.Item
              label={(
                <Space>
                  {I18n.t('admin.communication_template_subject_label')}
                  <SubjectPipedTextButton communicationKind={kind || ''} onInsert={insertSubjectText} />
                  {template && (
                    <Button type="link" size="small" onClick={() => setShowTranslations(true)}>
                      {I18n.t('admin.communication_center_manage_translations_action')}
                    </Button>
                  )}
                </Space>
              )}
              name="subject"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={I18n.t('admin.communication_template_body_label')}
              name="body"
              rules={[{ required: true }]}
            >
              <input type="hidden" id="resource_kind" value={kind || ''} readOnly />
              <EmailEditor content={body} handleContentChange={handleBodyChange} withPipedText />
            </Form.Item>

            <Modals modals={{ PipedTextModal }} />
            {template && showTranslations && (
              <TranslationsModal
                resourceName="communication_templates"
                id={template.id}
                close={() => setShowTranslations(false)}
              />
            )}
          </>
        )}
      </ResourceFormModal>
    </Provider>
  )
}
