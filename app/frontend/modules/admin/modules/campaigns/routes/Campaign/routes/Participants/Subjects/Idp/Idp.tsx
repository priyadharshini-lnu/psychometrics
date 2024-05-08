import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  App, Select, Button, Tag,
} from 'antd'
import _ from 'lodash'
import { IdpTemplate, IdpTemplateTR } from '~/modules/admin/modules/campaigns/core/idp/index'
import { useResources } from '~/hooks/useResources'
import { UserIdpPlan } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { User } from '~/modules/admin/modules/campaigns/core/user'

const { I18n } = window
interface SelectedIdpTemplate {
  id: string,
  name: string
}

export const Idp: React.FC<{}> = () => {
  const { message } = App.useApp()
  const { campaignId, id, projectId } = useParams<{ projectId: string, campaignId: string, id: string }>()
  const [selectedIdpTemplate, setSelectedIdpTemplate] = useState<SelectedIdpTemplate | null>()
  const [activeIdpTemplate, setActiveIdpTemplate] = useState<IdpTemplate | null>(null)

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
      basePath: `clients/${projectId}`,
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
    }).then((response: IdpTemplate) => {
      setActiveIdpTemplate(response)
    })
  }

  const handleSelectChange = (selectedTemplate: SelectedIdpTemplate) => {
    setSelectedIdpTemplate(selectedTemplate)
  }

  const handleSave = () => {
    if (selectedIdpTemplate !== null) {
      createResource({
        userId: id,
        campaignId,
        idpTemplateId: selectedIdpTemplate?.id,
        creatorId: id,
      }).then(() => {
        message.success(`${selectedIdpTemplate?.name} assigned to user`)
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(_, option: any) => {
          handleSelectChange({ id: option.key, name: option.value })
        }}
        value={selectedIdpTemplate?.name || (activeIdpTemplate ? activeIdpTemplate.name : undefined)}
      >
        {_.map(data, (idpTemplate: IdpTemplate) => (
          <Select.Option key={idpTemplate.id} value={idpTemplate.name}>
            {idpTemplate.name}
            {'     '}
            {activeIdpTemplate?.id === idpTemplate.id && <Tag color="green">Active</Tag>}
          </Select.Option>
        ))}
      </Select>

      <Button
        type="primary"
        onClick={handleSave}
        style={{ marginTop: '10px', marginRight: '10px' }}
        disabled={!selectedIdpTemplate}
      >
        {I18n.t('idp_templates.assign')}
      </Button>
    </>
  )
}
