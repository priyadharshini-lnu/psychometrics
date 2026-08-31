import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button, Table, Badge, Space, Tooltip, message, Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DeleteOutlined, EditOutlined, PlusOutlined, LoadingOutlined, SyncOutlined, EyeOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get, fetch, remove, REMOVE, loadMettlAssessments, loadSkillvueAssessments, loadMicrositeAssessments,
} from '~/modules/admin/modules/client/core/integrations'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { isRequestInProgress } from '~/core/request'
import { IntegrationFormModal } from './IntegrationFormModal'
import routeUtils from '~/utils/route'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'

const { Column } = Table

const connector = connect(
  (state: RootState) => ({
    integrations: get(state),
    isDeleteRequestInProgress: isRequestInProgress(state, REMOVE),
  }),
  {
    fetch,
    remove,
    openModal,
    loadMettlAssessments,
    loadSkillvueAssessments,
    loadMicrositeAssessments,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const { I18n } = window
const MODALS = {
  IntegrationFormModal,
}

const IntegrationsComponent: React.FC<Props> = ({
  integrations,
  fetch,
  remove,
  openModal,
  loadMettlAssessments,
  loadSkillvueAssessments,
  loadMicrositeAssessments,
  isDeleteRequestInProgress,
}) => {
  const { projectId } = useParams() as { projectId: string }
  const navigate = useNavigate()
  const prefix = `${settings.urlPrefix}/:projectId/settings`

  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(navigate, prefix, `/${currentTab}`)
  }

  useEffect(() => {
    fetch(projectId)
  }, [])

  const handleMettlLoad = () => {
    loadMettlAssessments(projectId)
      .then(() => {
        message.success(I18n.t('admin.integrations_load_mettl_success'))
      })
  }

  const handleSkillvueLoad = () => {
    loadSkillvueAssessments(projectId)
      .then(() => {
        message.success(I18n.t('admin.integrations_load_skillvue_success'))
      })
  }

  const handleMicrositeLoad = () => {
    loadMicrositeAssessments(projectId)
      .then(() => {
        message.success(I18n.t('admin.integrations_load_microsite_success'))
      })
  }

  return (
    <>
      <TableLayout
        title={I18n.t('admin.integrations_integrations')}
        recordCount={integrations.length}
        filters={(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal('IntegrationFormModal')}
          >
            {I18n.t('admin.integrations_actions_add')}
          </Button>
        )}
        table={(
          <Table dataSource={integrations} pagination={false} scroll={{ x: 'max-content' }}>
            <Column
              title={I18n.t('common.column.status')}
              minWidth={150}
              fixed="left"
              render={({ active }) => (
                <Badge status={active ? 'success' : 'default'} text={active ? 'Active' : 'Inactive'} />
              )}
            />
            <Column
              title={I18n.t('admin.integrations_columns_name')}
              minWidth={200}
              render={({ name }) => I18n.t(`admin.integrations_names_${name}`)}
            />
            <Column
              title={I18n.t('admin.integrations_columns_details')}
              minWidth={200}
              render={({
                name,
                mettlIntegrationDetails,
                hoganIntegrationDetails,
                iihtIntegrationDetails,
                skillvueIntegrationDetails,
                yoodliIntegrationDetails,
              }) => {
                if (name === 'hogan') {
                  return (
                    <>
                      <b>
                        {I18n.t('admin.integrations_details_provider')}
                        :
                      </b>
                      <div>
                        <Typography.Text
                          copyable={hoganIntegrationDetails.provider
                            ? { text: hoganIntegrationDetails.provider }
                            : false}
                        >
                          {hoganIntegrationDetails.provider}
                        </Typography.Text>
                      </div>
                    </>
                  )
                }

                if (name === 'mettl') {
                  return (
                    <>
                      <b>
                        {I18n.t('admin.integrations_details_webhookUrls')}
                        :
                      </b>
                      <div>
                        <div>
                          <Typography.Text
                            copyable={mettlIntegrationDetails.completionWebhookUrl
                              ? { text: mettlIntegrationDetails.completionWebhookUrl }
                              : false}
                          >
                            {mettlIntegrationDetails.completionWebhookUrl}
                          </Typography.Text>
                        </div>
                        <div>
                          <Typography.Text
                            copyable={mettlIntegrationDetails.resultsWebhookUrl
                              ? { text: mettlIntegrationDetails.resultsWebhookUrl }
                              : false}
                          >
                            {mettlIntegrationDetails.resultsWebhookUrl}
                          </Typography.Text>
                        </div>
                      </div>
                    </>
                  )
                }

                if (name === 'skillvue') {
                  return (
                    <>
                      <b>
                        {I18n.t('admin.integrations_details_webhookUrls')}
                        :
                      </b>
                      <div>
                        <div>
                          <Typography.Text
                            copyable={skillvueIntegrationDetails.completionWebhookUrl
                              ? { text: skillvueIntegrationDetails.completionWebhookUrl }
                              : false}
                          >
                            {skillvueIntegrationDetails.completionWebhookUrl}
                          </Typography.Text>
                        </div>
                        <div>
                          <Typography.Text
                            copyable={skillvueIntegrationDetails.resultsWebhookUrl
                              ? { text: skillvueIntegrationDetails.resultsWebhookUrl }
                              : false}
                          >
                            {skillvueIntegrationDetails.resultsWebhookUrl}
                          </Typography.Text>
                        </div>
                      </div>
                    </>
                  )
                }

                if (name === 'iiht') {
                  return (
                    <>
                      <b>
                        {I18n.t('admin.integrations_details_webhookUrl')}
                        :
                      </b>
                      <div>
                        <div>
                          <Typography.Text
                            copyable={iihtIntegrationDetails.webhookUrl
                              ? { text: iihtIntegrationDetails.webhookUrl }
                              : false}
                          >
                            {iihtIntegrationDetails.webhookUrl}
                          </Typography.Text>
                        </div>
                      </div>
                    </>
                  )
                }

                if (name === 'microsite') {
                  return null
                }

                if (name === 'yoodli') {
                  return (
                    <>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_platform_id')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.platformId
                            ? { text: yoodliIntegrationDetails.platformId }
                            : false}
                        >
                          {yoodliIntegrationDetails.platformId}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_client_id')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.clientId
                            ? { text: yoodliIntegrationDetails.clientId }
                            : false}
                        >
                          {yoodliIntegrationDetails.clientId}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_deployment_id')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.deploymentId
                            ? { text: yoodliIntegrationDetails.deploymentId }
                            : false}
                        >
                          {yoodliIntegrationDetails.deploymentId}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_platform_public_keyset_url')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.platformPublicKeysetUrl
                            ? { text: yoodliIntegrationDetails.platformPublicKeysetUrl }
                            : false}
                        >
                          {yoodliIntegrationDetails.platformPublicKeysetUrl}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_platform_access_token_url')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.platformAccessTokenUrl
                            ? { text: yoodliIntegrationDetails.platformAccessTokenUrl }
                            : false}
                        >
                          {yoodliIntegrationDetails.platformAccessTokenUrl}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_platform_authentication_request_url')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.platformAuthenticationRequestUrl
                            ? { text: yoodliIntegrationDetails.platformAuthenticationRequestUrl }
                            : false}
                        >
                          {yoodliIntegrationDetails.platformAuthenticationRequestUrl}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('admin.integrations_details_platform_host_name')}
                          :
                        </b>
                        {' '}
                        <Typography.Text
                          copyable={yoodliIntegrationDetails.platformHostName
                            ? { text: yoodliIntegrationDetails.platformHostName }
                            : false}
                        >
                          {yoodliIntegrationDetails.platformHostName}
                        </Typography.Text>
                      </div>
                    </>
                  )
                }

                return null
              }}
            />
            <Column
              title={I18n.t('shared.action')}
              fixed="right"
              render={integration => (
                <Space size="middle">
                  {integration.name === 'mettl' && (
                    <>
                      <Tooltip title={I18n.t('admin.integrations_actions_load_mettl_catalog')}>
                        <span><SyncOutlined onClick={handleMettlLoad} /></span>
                      </Tooltip>
                      <Tooltip title={I18n.t('admin.integrations_view_all_schedules')}>
                        <span>
                          <EyeOutlined onClick={() => handleTabChange('integrations/mettl_schedule_records')} />
                        </span>
                      </Tooltip>
                    </>
                  )}
                  {integration.name === 'skillvue' && (
                    <>
                      <Tooltip title={I18n.t('admin.integrations_actions_load_skillvue_catalog')}>
                        <span><SyncOutlined onClick={handleSkillvueLoad} /></span>
                      </Tooltip>
                    </>
                  )}
                  {integration.name === 'microsite' && (
                    <>
                      <Tooltip title={I18n.t('admin.integrations_actions_load_microsite_catalog')}>
                        <span><SyncOutlined onClick={handleMicrositeLoad} /></span>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title={I18n.t('shared.edit')}>
                    <span><EditOutlined onClick={() => openModal('IntegrationFormModal', { integration })} /></span>
                  </Tooltip>
                  <Tooltip title={I18n.t('shared.delete')}>
                    <span>
                      {isDeleteRequestInProgress ? <LoadingOutlined />
                        : <DeleteOutlined onClick={() => remove(projectId, integration.id)} />}
                    </span>
                  </Tooltip>
                </Space>


              )}
            />
          </Table>
        )}
      />
      <Modals modals={MODALS} />
    </>
  )
}

export const Integrations = connector(IntegrationsComponent)
