import React, { useState } from 'react'
import {
  App, Button, Dropdown, Tag,
} from 'antd'
import { PlusOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { formatedDate } from '~/utils/time'
import { CommunicationTemplate } from './core/communicationTemplates'
import { STATUSES, TemplateLevel, TemplateScope } from './constants'
import { TemplateForm } from './TemplateForm'
import { OverrideTemplatePicker } from './OverrideTemplatePicker'
import { CopyTemplateModal } from './CopyTemplateModal'
import { getTemplateActions, TemplateAction } from './templateActions'

const { I18n } = window

interface FormState {
  template?: CommunicationTemplate
  sourceTemplate?: CommunicationTemplate
}

export const buildScopeFilter = (level: TemplateLevel, scope: TemplateScope): Record<string, string> => {
  const filter: Record<string, string> = { level_eq: level }
  if (level === 'client' && scope.clientId) filter.client_id_eq = scope.clientId
  if (level === 'project' && scope.projectId) filter.project_id_eq = scope.projectId
  if (level === 'campaign' && scope.campaignId) filter.campaign_id_eq = scope.campaignId
  return filter
}

const TemplatesFilter: React.FC<{
  level: TemplateLevel
  onCreate: () => void
  onCopy: () => void
  onOverride: () => void
}> = ({
  level, onCreate, onCopy, onOverride,
}) => {
  const { resource } = useResourceContext<CommunicationTemplate>()
  const tableLoading = resource.isLoading('fetch')

  const actionLabels: Record<TemplateAction, string> = {
    create: I18n.t('admin.communication_template_create_new_action'),
    copy: I18n.t('admin.communication_template_copy_from_existing_action'),
    override: I18n.t('admin.communication_template_override_inherited_action'),
  }
  const menuItems = getTemplateActions(level).map(action => ({
    key: action,
    label: actionLabels[action],
  }))
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'create') onCreate()
    if (key === 'copy') onCopy()
    if (key === 'override') onOverride()
  }

  return (
    <Resource.Filter name="filterable_fields">
      <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']} disabled={tableLoading}>
        <Button type="primary">
          <PlusOutlined />
          {I18n.t('admin.communication_template_new_button')}
          <DownOutlined />
        </Button>
      </Dropdown>
    </Resource.Filter>
  )
}

const SourceCell: React.FC<{ template: CommunicationTemplate }> = ({ template }) => {
  if (!template.inheritsFrom) {
    return <Tag color="blue">{I18n.t('admin.communication_template_source_created')}</Tag>
  }
  return (
    <Tag>
      {I18n.t('admin.communication_template_source_override_of', {
        level: I18n.t(`admin.communication_template_level_${template.inheritsFrom.level}`),
      })}
    </Tag>
  )
}

interface TableProps {
  onEdit: (template: CommunicationTemplate) => void
}

const TemplatesTable: React.FC<TableProps> = ({ onEdit }) => {
  const { resource } = useResourceContext<CommunicationTemplate>()
  const statusFilteredValue = resource.getFilteredValue('status_in') as string[] | undefined

  return (
    <Resource.Table pagination>
      <Resource.Column<CommunicationTemplate>
        id="name"
        title={I18n.t('shared.name')}
        hideable={false}
        sorter
        width={260}
        fixed="left"
      />
      <Resource.Column<CommunicationTemplate>
        id="type"
        dataIndex="kind"
        title={I18n.t('shared.type')}
        sorter
        width={180}
      />
      <Resource.Column<CommunicationTemplate>
        id="source"
        title={I18n.t('admin.communication_template_source_label')}
        width={140}
        render={(_value, template) => <SourceCell template={template} />}
      />
      <Resource.Column<CommunicationTemplate>
        id="status"
        title={I18n.t('shared.status')}
        sorter
        width={120}
        filters={STATUSES.map(status => ({
          text: I18n.t(`admin.communication_template_status_${status}`),
          value: status,
        }))}
        filteredValue={statusFilteredValue}
      />
      <Resource.Column<CommunicationTemplate>
        id="updated_at"
        dataIndex="updatedAt"
        title={I18n.t('shared.updated_at')}
        sorter
        width={180}
        render={value => formatedDate(value)}
      />
      <Resource.Column<CommunicationTemplate>
        id="action"
        title={I18n.t('common.column.action')}
        hideable={false}
        width={180}
        fixed="right"
        render={(_value, template) => (
          <Button type="link" onClick={() => onEdit(template)}>
            {I18n.t('common.actions.edit')}
          </Button>
        )}
      />
    </Resource.Table>
  )
}

interface Props {
  level: TemplateLevel
  scope?: TemplateScope
}

export const CommunicationTemplatesList: React.FC<Props> = ({ level, scope = {} }) => {
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [showOverridePicker, setShowOverridePicker] = useState(false)
  const { message } = App.useApp()

  const config = {
    trackUrl: true,
    initialFilter: { status_in: ['draft', 'active'] },
    apiConfig: {
      filter: buildScopeFilter(level, scope),
      include: ['inherits_from'],
    },
  }

  const closeForm = () => setFormState(null)

  return (
    <Resource
      title={I18n.t('admin.communication_templates')}
      config={config}
      name="communication_templates"
      settingsKey={TABLE_SETTINGS_KEYS.communicationCenterTemplates}
    >
      <TemplatesFilter
        level={level}
        onCreate={() => setFormState({})}
        onCopy={() => setShowCopyModal(true)}
        onOverride={() => setShowOverridePicker(true)}
      />
      <TemplatesTable
        onEdit={template => setFormState({ template })}
      />
      {showOverridePicker && (
        <OverrideTemplatePicker
          level={level}
          scope={scope}
          close={() => setShowOverridePicker(false)}
          onSelect={(sourceTemplate) => {
            setShowOverridePicker(false)
            setFormState({ sourceTemplate })
          }}
        />
      )}
      {formState && (
        <TemplateForm
          level={level}
          scope={scope}
          template={formState.template}
          sourceTemplate={formState.sourceTemplate}
          close={closeForm}
        />
      )}
      {showCopyModal && (
        <CopyTemplateModal
          level={level}
          scope={scope}
          close={() => setShowCopyModal(false)}
          onCopied={() => {
            setShowCopyModal(false)
            message.success(I18n.t('admin.communication_template_copy_success'))
          }}
        />
      )}
    </Resource>
  )
}
