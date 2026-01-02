import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Button, Table, Badge, Space, Tooltip, message, Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DeleteOutlined, EditOutlined, PlusOutlined, LoadingOutlined, SyncOutlined, EyeOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get, fetch, remove, REMOVE, loadMettlAssessments, loadSkillvueAssessments,
} from '~/modules/admin/modules/client/core/integrations'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { isRequestInProgress } from '~/core/request'
import { IntegrationFormModal } from './IntegrationFormModal'
import routeUtils from '~/utils/route'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import { useWindowSize } from '~/hooks/useWindowSize'

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
  isDeleteRequestInProgress,
}) => {
  const { projectId } = useParams() as { projectId: string }
  const { width: windowWidth } = useWindowSize()
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
        message.success(I18n.t('administration.integrations.load_mettl_success'))
      })
  }

  const handleSkillvueLoad = () => {
    loadSkillvueAssessments(projectId)
      .then(() => {
        message.success(I18n.t('administration.integrations.load_skillvue_success'))
      })
  }

  return (
    <>
      <Row className="pl">
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="mb-4"
            style={{ marginRight: '10px' }}
            onClick={() => openModal('IntegrationFormModal')}
          >
            {I18n.t('administration.integrations.actions.add')}
          </Button>

          <Table dataSource={integrations} pagination={false} scroll={{ x: 'max-content' }}>
            <Column
              title={I18n.t('common.column.status')}
              fixed={windowWidth > 800 ? 'left' : undefined}
              render={({ active }) => (
                <Badge status={active ? 'success' : 'default'} text={active ? 'Active' : 'Inactive'} />
              )}
            />
            <Column
              title={I18n.t('administration.integrations.columns.name')}
              render={({ name }) => I18n.t(`administration.integrations.names.${name}`)}
            />
            <Column
              title={I18n.t('administration.integrations.columns.details')}
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
                        {I18n.t('administration.integrations.details.provider')}
                        :
                      </b>
                      <div>
                        <Typography.Text copyable={{ text: hoganIntegrationDetails.provider }}>
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
                        {I18n.t('administration.integrations.details.webhookUrls')}
                        :
                      </b>
                      <div>
                        <div>
                          <Typography.Text copyable={{ text: mettlIntegrationDetails.completionWebhookUrl }}>
                            {mettlIntegrationDetails.completionWebhookUrl}
                          </Typography.Text>
                        </div>
                        <div>
                          <Typography.Text copyable={{ text: mettlIntegrationDetails.resultsWebhookUrl }}>
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
                        {I18n.t('administration.integrations.details.webhookUrls')}
                        :
                      </b>
                      <div>
                        <div>
                          <Typography.Text copyable={{ text: skillvueIntegrationDetails.completionWebhookUrl }}>
                            {skillvueIntegrationDetails.completionWebhookUrl}
                          </Typography.Text>
                        </div>
                        <div>
                          <Typography.Text copyable={{ text: skillvueIntegrationDetails.resultsWebhookUrl }}>
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
                        {I18n.t('administration.integrations.details.webhookUrl')}
                        :
                      </b>
                      <div>
                        <div>
                          <Typography.Text copyable={{ text: iihtIntegrationDetails.webhookUrl }}>
                            {iihtIntegrationDetails.webhookUrl}
                          </Typography.Text>
                        </div>
                      </div>
                    </>
                  )
                }

                if (name === 'yoodli') {
                  return (
                    <>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_id')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.platformId }}>
                          {yoodliIntegrationDetails.platformId}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.client_id')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.clientId }}>
                          {yoodliIntegrationDetails.clientId}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.deployment_id')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.deploymentId }}>
                          {yoodliIntegrationDetails.deploymentId}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_public_keyset_url')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.platformPublicKeysetUrl }}>
                          {yoodliIntegrationDetails.platformPublicKeysetUrl}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_access_token_url')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.platformAccessTokenUrl }}>
                          {yoodliIntegrationDetails.platformAccessTokenUrl}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_authentication_request_url')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.platformAuthenticationRequestUrl }}>
                          {yoodliIntegrationDetails.platformAuthenticationRequestUrl}
                        </Typography.Text>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_host_name')}
                          :
                        </b>
                        {' '}
                        <Typography.Text copyable={{ text: yoodliIntegrationDetails.platformHostName }}>
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
              title={I18n.t('common.column.action')}
              fixed={windowWidth > 800 ? 'right' : undefined}
              render={integration => (
                <Space size="middle">
                  {integration.name === 'mettl' && (
                    <>
                      <Tooltip title={I18n.t('administration.integrations.actions.load_mettl_catalog')}>
                        <SyncOutlined onClick={handleMettlLoad} />
                      </Tooltip>
                      <Tooltip title={I18n.t('administration.integrations.view_all_schedules')}>
                        <EyeOutlined onClick={() => handleTabChange('integrations/mettl_schedule_records')} />
                      </Tooltip>
                    </>
                  )}
                  {integration.name === 'skillvue' && (
                    <>
                      <Tooltip title={I18n.t('administration.integrations.actions.load_skillvue_catalog')}>
                        <SyncOutlined onClick={handleSkillvueLoad} />
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title={I18n.t('common.actions.edit')}>
                    <EditOutlined onClick={() => openModal('IntegrationFormModal', { integration })} />
                  </Tooltip>
                  <Tooltip title={I18n.t('common.actions.delete')}>
                    {isDeleteRequestInProgress ? <LoadingOutlined />
                      : <DeleteOutlined onClick={() => remove(projectId, integration.id)} />}
                  </Tooltip>
                </Space>


              )}
            />
          </Table>
        </Col>
        <Modals modals={MODALS} />
      </Row>
    </>
  )
}

export const Integrations = connector(IntegrationsComponent)
