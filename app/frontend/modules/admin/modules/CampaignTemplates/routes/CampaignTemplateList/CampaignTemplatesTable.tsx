import React from 'react'
import {
  Button, MenuProps, Typography, App,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
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
      title: I18n.t('administration.campaign_templates.remove_confirm.title'),
      content: I18n.t('administration.campaign_templates.remove_confirm.content', { name: campaignTemplate.name }),
      okText: I18n.t('common.text.confirm'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        resource.removeResource(campaignTemplate.id).then(() => {
          message.success(I18n.t('administration.campaign_templates.remove_confirm.success',
            { name: campaignTemplate.name }))
        })
      },
    })
  }

  return (
    <Resource.Table pagination>
      <Resource.Column<CampaignTemplate>
        title={I18n.t('common.column.id')}
        id="id"
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('common.column.name')}
        id="name"
        render={campaignTemplate => <Typography.Text copyable>{campaignTemplate.name}</Typography.Text>}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('administration.campaign_templates.column.assessment')}
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
        title={I18n.t('administration.campaign_templates.column.report')}
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
        title={I18n.t('administration.campaign_templates.column.owner')}
        id="owner.name"
        render={campaignTemplate => (campaignTemplate.owner?.id ? (
          <Typography.Link
            copyable
            href={`/admin/clients/${campaignTemplate.owner?.id}`}
            target="_blank"
          >
            {campaignTemplate.owner?.name}
          </Typography.Link>
        ) : null)}
        width={400}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('common.column.updated_at')}
        id="updated_at"
        width={300}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('common.column.created_at')}
        id="created_at"
        width={300}
        sorter
      />
      <Resource.Column<CampaignTemplate>
        title={I18n.t('common.column.action')}
        id="action"
        render={(_, campaignTemplate) => (
          <Dropdown
            campaignTemplate={campaignTemplate}
            openModal={openModal}
            removeCampaignTemplate={handleRemoveCampaignTemplate}
          />
        )}
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
          {I18n.t('common.actions.edit')}
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
          {I18n.t('common.actions.remove')}
        </Button>),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}
