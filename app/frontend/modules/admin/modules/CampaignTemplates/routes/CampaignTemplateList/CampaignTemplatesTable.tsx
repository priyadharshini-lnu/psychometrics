import React from 'react'
import {
  Button, MenuProps, Typography, App,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { CampaignTemplate } from '~/modules/admin/core/types/campaignTemplates'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Props = {
  openModal: (campaignTemplate?: CampaignTemplate) => void
}
export const CampaignTemplatesTable: React.FC<Props> = ({ openModal }) => {
  const { resource } = useResourceContext<CampaignTemplate, BaseMeta>()
  const { modal, message } = App.useApp()

  const handleRemoveCampaignTemplate = (campaignTemplate: CampaignTemplate) => {
    modal.confirm({
      title: I18n.t('admin.campaign_templates_remove_confirm_title'),
      content: I18n.t('admin.campaign_templates_remove_confirm_content', { name: campaignTemplate.name }),
      okText: I18n.t('shared.confirm'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        resource.removeResource(campaignTemplate.id).then(() => {
          message.success(I18n.t('admin.campaign_templates_remove_confirm_success',
            { name: campaignTemplate.name }))
        })
      },
    })
  }

  return (
    <Resource.Table pagination>
      <Resource.Column<CampaignTemplate>
        title={I18n.t('shared.id')}
        id="id"
        sorter
        width={100}
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('shared.name')}
        id="name"
        render={campaignTemplate => <Typography.Text copyable>{campaignTemplate.name}</Typography.Text>}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('admin.campaign_templates_column_assessment')}
        id="assessment.name"
        render={campaignTemplate => (campaignTemplate.assessment?.id ? (
          <Typography.Link
            copyable
            href={`/administration/assessments/${campaignTemplate.assessment.id}`}
            target="_blank"
          >
            {campaignTemplate.assessment?.name}
          </Typography.Link>
        ) : null)}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('admin.campaign_templates_column_report')}
        id="report.name"
        render={campaignTemplate => (campaignTemplate.report?.id ? (
          <Typography.Link
            copyable
            href={`/administration/reports/${campaignTemplate.report?.id}`}
            target="_blank"
          >
            {campaignTemplate.report?.name}
          </Typography.Link>
        ) : null)}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('admin.campaign_templates_column_campaign')}
        id="campaign.name"
        render={campaignTemplate => (campaignTemplate.campaign?.id ? (
          <Typography.Link
            copyable
            href={`
              /admin/projects/${campaignTemplate.campaign?.projectId}/new_campaigns/${campaignTemplate.campaign?.id}`}
            target="_blank"
          >
            {campaignTemplate.campaign?.name}
          </Typography.Link>
        ) : null)}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('admin.campaign_templates_column_owner')}
        id="owner.name"
        render={campaignTemplate => (campaignTemplate.owner?.id ? (
          <Typography.Link
            copyable
            href={`/admin/clients/${campaignTemplate.owner?.id}`}
            target="_blank"
          >
            {campaignTemplate.owner?.name}
          </Typography.Link>
        ) : (
          <Typography.Text>{I18n.t('admin.platform_owner')}</Typography.Text>
        ))}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('shared.updated_at')}
        id="updated_at"
        width={300}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('shared.created_at')}
        id="created_at"
        width={300}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('shared.action')}
        id="action"
        render={(_, campaignTemplate) => (
          <Dropdown
            campaignTemplate={campaignTemplate}
            openModal={openModal}
            removeCampaignTemplate={handleRemoveCampaignTemplate}
          />
        )}
        width={100}
      />
    </Resource.Table>
  )
}

type DropDownProps = {
  campaignTemplate: CampaignTemplate,
  openModal: Props['openModal']
  removeCampaignTemplate: (campaignTemplate: CampaignTemplate) => void
}
const Dropdown: React.FC<DropDownProps> = ({ campaignTemplate, openModal, removeCampaignTemplate }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ campaignTemplate, openModal, removeCampaignTemplate })}
  />
)

interface ActionMenuData {
  campaignTemplate: CampaignTemplate,
  openModal: Props['openModal'],
  removeCampaignTemplate: (campaignTemplate: CampaignTemplate) => void
}

const getActionsMenuProps = ({ campaignTemplate, openModal, removeCampaignTemplate }: ActionMenuData):MenuProps => {
  const menuItems = [
    campaignTemplate && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal(campaignTemplate)}
          className="ps-0"
        >
          {I18n.t('shared.edit')}
        </Button>),
    },
    campaignTemplate && {
      key: 'delete',
      label: (
        <Button
          type="link"
          onClick={() => removeCampaignTemplate(campaignTemplate)}
          className="ps-0"
        >
          {I18n.t('shared.remove')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
