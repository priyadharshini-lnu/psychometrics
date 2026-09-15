import React, { useEffect, useRef, useState } from 'react'
import {
  Form, Modal, Select, Spin,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { CommunicationTemplate, CommunicationTemplateTR } from './core/communicationTemplates'
import { TemplateLevel, TemplateScope } from './constants'

const { I18n } = window

interface Props {
  level: TemplateLevel
  scope: TemplateScope
  close(): void
  onCopied(): void
}

const buildCandidateFilter = (
  level: TemplateLevel,
  scope: TemplateScope,
): Record<string, string> => {
  const filter: Record<string, string> = {
    level_eq: level,
    only_copy_candidates: 'true',
  }
  if (level === 'client' && scope.clientId) filter.client_id_eq = scope.clientId
  if (level === 'project' && scope.projectId) filter.project_id_eq = scope.projectId
  if (level === 'campaign' && scope.campaignId) filter.campaign_id_eq = scope.campaignId
  return filter
}

export const CopyTemplateModal: React.FC<Props> = ({
  level, scope, close, onCopied,
}) => {
  const [form] = Form.useForm()
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([])
  const loadedScopeKey = useRef<string>()
  const { resource } = useResourceContext<CommunicationTemplate>()
  const {
    fetch: fetchTemplates,
    isLoading,
  } = useResources<CommunicationTemplate>('communication_templates', { responseType: CommunicationTemplateTR })

  useEffect(() => {
    const scopeKey = `${level}-${scope.clientId || ''}-${scope.projectId || ''}-${scope.campaignId || ''}`
    if (loadedScopeKey.current === scopeKey) return
    loadedScopeKey.current = scopeKey

    fetchTemplates({
      apiConfig: {
        filter: buildCandidateFilter(level, scope),
        include: ['client', 'project', 'campaign'],
      },
    }).then(({ data }) => setTemplates(data))
  }, [fetchTemplates, level, scope])

  const copyTemplate = (values: { sourceTemplateId: string }) => {
    resource.memberAction({
      id: values.sourceTemplateId,
      action: 'copy',
      method: 'post',
      responseType: CommunicationTemplateTR,
      body: targetPayload(),
    }).then(() => {
      resource.fetch()
      onCopied()
      close()
    })
  }

  const targetPayload = () => {
    if (level === 'client') return { targetClientId: scope.clientId }
    if (level === 'project') return { targetProjectId: scope.projectId }
    if (level === 'campaign') return { targetCampaignId: scope.campaignId }
    return {}
  }

  const templateLabel = (template: CommunicationTemplate) => {
    const scopeName = {
      client: template.client?.name,
      project: template.project?.name,
      campaign: template.campaign?.name,
      platform: undefined,
    }[level]
    return scopeName ? `${template.name} - ${scopeName}` : template.name
  }

  const loading = isLoading('fetch')

  return (
    <Modal
      open
      title={I18n.t('admin.communication_template_copy_modal_title')}
      onCancel={close}
      okText={I18n.t('admin.communication_template_copy_action')}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={copyTemplate}>
        <Form.Item
          name="sourceTemplateId"
          label={I18n.t('admin.communication_template_source_template_label')}
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={loading}
            notFoundContent={loading ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            options={templates.map(template => ({
              value: template.id,
              label: templateLabel(template),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
