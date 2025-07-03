import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  App, Select, Button, Tag, Flex,
} from 'antd'
import _ from 'lodash'
import { IdpTemplate, IdpTemplateTR } from '~/modules/admin/modules/campaigns/core/idp/index'
import { useResources } from '~/hooks/useResources'
import { UserIdpPlan, UserActiveIdpTemplateTR, UserActiveIdpTemplate } from
  '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { User } from '~/modules/admin/modules/campaigns/core/user'

const { I18n } = window

export const Idp: React.FC<{}> = () => {
  const { message } = App.useApp()
  const { campaignId, id, projectId } = useParams() as { projectId: string, campaignId: string, id: string }
  const [selectedIdpTemplate, setSelectedIdpTemplate] = useState<string | null>()
  const [activeIdpPlan, setActiveIdpPlan] = useState<UserActiveIdpTemplate | null>(null)

  const navigate = useNavigate()


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
        filter: { status_eq: 'published' },
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
      responseType: UserActiveIdpTemplateTR,
    }).then((response: UserActiveIdpTemplate) => {
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
        if (error.base) {
          message.error(error.base[0]?.title)
        }
        if (error.userId) {
          message.error(error.userId?.title)
        }
      })
    }
  }

  useEffect(() => {
    fetch()
    getActiveIdpTemplate()
  }, [])

  return (
    <Flex vertical>
      <h3>{I18n.t('idp_templates.assign_idp_template')}</h3>

      <Flex wrap justify="space-between">
        <Flex className="m4">
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
            style={{ marginRight: '10px' }}
            disabled={!selectedIdpTemplate || selectedIdpTemplate === activeIdpPlan?.idpTemplateId.toString()}
          >
            {I18n.t('idp_templates.assign')}
          </Button>
        </Flex>

        {activeIdpPlan && (
          <Flex className="m4">
            <Button
              style={{ marginRight: '8px' }}
              onClick={() => {
                // eslint-disable-next-line max-len
                navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/user_idp_reports/${activeIdpPlan.id}`)
              }}
            >
              {I18n.t('user_reports.preview_report')}
            </Button>


            <Button
              onClick={() => {
              // eslint-disable-next-line max-len
                navigate(`${activeIdpPlan?.id}/step/getting_started`)
              }}
            >
              {I18n.t('idp.manage_plan')}
            </Button>
          </Flex>

        )}
      </Flex>

    </Flex>
  )
}
