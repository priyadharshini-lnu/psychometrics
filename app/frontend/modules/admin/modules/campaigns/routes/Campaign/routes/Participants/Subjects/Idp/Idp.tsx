import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  App, Select, Button, Tag,
} from 'antd'
import _ from 'lodash'
import { IdpTemplate, IdpTemplateTR } from '~/modules/admin/modules/campaigns/core/idp/index'
import { useResources } from '~/hooks/useResources'
import { UserIdpPlan, UserIdpPlanTR } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { User } from '~/modules/admin/modules/campaigns/core/user'

const { I18n } = window

export const Idp: React.FC<{}> = () => {
  const { message } = App.useApp()
  const { campaignId, id, projectId } = useParams() as { projectId: string, campaignId: string, id: string }
  const [selectedIdpTemplate, setSelectedIdpTemplate] = useState<string | null>()
  const [activeIdpPlan, setActiveIdpPlan] = useState<UserIdpPlan | null>(null)


  const {
    createResource,
  } = useResources<UserIdpPlan>(
    'user_idp_plans',
  )

  const {
    data, fetch,
  } = useResources<IdpTemplate>(
    'idp_templates',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      responseType: IdpTemplateTR,
      apiConfig: {
        fields: { idp_templates: ['name', 'description'] },
      },
    },
  )

  const {
    memberAction: activeIdpTemplateCollectionAction,
  } = useResources<User>(
    'users',
    { basePath: `campaigns/${campaignId}` },
  )

  const getActiveIdpTemplate = () => {
    activeIdpTemplateCollectionAction({
      id,
      action: 'active_idp_template',
      method: 'get',
      responseType: UserIdpPlanTR,
    }).then((response: UserIdpPlan) => {
      setActiveIdpPlan(response)
    })
  }

  const handleSelectChange = (selectedTemplate: string) => {
    setSelectedIdpTemplate(selectedTemplate)
  }

  const handleSave = () => {
    if (selectedIdpTemplate !== null && selectedIdpTemplate !== activeIdpPlan?.idpTemplateId.toString()) {
      createResource({
        userId: id,
        campaignId,
        idpTemplateId: selectedIdpTemplate,
        creatorId: id,
      }).then(() => {
        const name = data.find(idpTemplate => idpTemplate.id === selectedIdpTemplate)?.name
        message.success(`${name} assigned to user`)
        setSelectedIdpTemplate(null)
        getActiveIdpTemplate()
      }).catch((error) => {
        message.error(error.userId.title)
      })
    }
  }

  useEffect(() => {
    fetch()
    getActiveIdpTemplate()
  }, [])

  return (
    <>
      <h3>{I18n.t('idp_templates.assign_idp_template')}</h3>
      <Select
        showSearch
        placeholder={I18n.t('idp_templates.placeholder')}
        style={{ width: '700px' }}
        onChange={(value) => {
          handleSelectChange(value)
        }}
        value={selectedIdpTemplate || (activeIdpPlan?.idpTemplateId.toString())}
      >
        {_.map(data, (idpTemplate: IdpTemplate) => (
          <Select.Option key={idpTemplate.id} value={idpTemplate.id}>
            {idpTemplate.name}
            {'     '}
            {activeIdpPlan?.idpTemplateId === +idpTemplate.id && <Tag color="green">Active</Tag>}
          </Select.Option>
        ))}
      </Select>

      <Button
        type="primary"
        onClick={handleSave}
        style={{ marginTop: '10px', marginRight: '10px' }}
        disabled={!selectedIdpTemplate || selectedIdpTemplate === activeIdpPlan?.idpTemplateId.toString()}
      >
        {I18n.t('idp_templates.assign')}
      </Button>
      {activeIdpPlan && (
        <Link
          type="link"
          to={`/admin/projects/${projectId}/new_campaigns/${campaignId}/user_idp_reports/${activeIdpPlan.id}`}
        >
          {I18n.t('user_reports.preview_report')}
        </Link>
      )}
    </>
  )
}
