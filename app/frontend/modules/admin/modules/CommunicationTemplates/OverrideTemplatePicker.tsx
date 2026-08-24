import React, { useEffect, useState } from 'react'
import {
  Modal, Select, Spin, Tag,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { CommunicationTemplate, CommunicationTemplateTR } from './core/communicationTemplates'
import { TemplateLevel, TemplateScope } from './constants'
import { buildScopeFilter } from './CommunicationTemplatesList'

const { I18n } = window

interface Props {
  level: TemplateLevel
  scope: TemplateScope
  close(): void
  onSelect(template: CommunicationTemplate): void
}

export const OverrideTemplatePicker: React.FC<Props> = ({
  level, scope, close, onSelect,
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [candidates, setCandidates] = useState<CommunicationTemplate[]>([])
  const [ownKinds, setOwnKinds] = useState<Set<string> | null>(null)

  const { fetch: fetchOwn } = useResources<CommunicationTemplate>('communication_templates', {
    responseType: CommunicationTemplateTR,
  })
  const { fetch: fetchCandidates, isLoading } = useResources<CommunicationTemplate>('communication_templates', {
    responseType: CommunicationTemplateTR,
  })

  useEffect(() => {
    fetchOwn({
      apiConfig: { filter: buildScopeFilter(level, scope), page: { number: 1, size: 200 } },
    }).then(({ data }) => setOwnKinds(new Set(data.map(template => template.kind))))
  }, [level, scope.clientId, scope.projectId, scope.campaignId])

  useEffect(() => {
    fetchCandidates({
      apiConfig: {
        filter: { ...buildScopeFilter(level, scope), include_inherited: 'true', name_cont: searchValue },
        page: { number: 1, size: 50 },
      },
    }).then(({ data }) => setCandidates(data))
  }, [level, scope.clientId, scope.projectId, scope.campaignId, searchValue])

  const options = ownKinds
    ? candidates.filter(template => template.level !== level && !ownKinds.has(template.kind))
    : []

  return (
    <Modal
      open
      title={I18n.t('admin.communication_template_override_picker_title')}
      onCancel={close}
      footer={null}
      destroyOnHidden
    >
      <Select
        autoFocus
        showSearch
        style={{ width: '100%' }}
        filterOption={false}
        placeholder={I18n.t('admin.communication_template_override_picker_search_placeholder')}
        onSearch={setSearchValue}
        onSelect={(value: string) => {
          const template = options.find(option => option.id === value)
          if (template) onSelect(template)
        }}
        notFoundContent={isLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
      >
        {options.map(template => (
          <Select.Option key={template.id} value={template.id}>
            {I18n.t(`administration.communications.form.${template.kind}`)}
            {' — '}
            {template.name}
            {' '}
            <Tag>{I18n.t(`admin.communication_template_level_${template.level}`)}</Tag>
          </Select.Option>
        ))}
      </Select>
    </Modal>
  )
}
