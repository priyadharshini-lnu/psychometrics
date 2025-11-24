import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Button, Table, Badge, Space, Tooltip, message,
} from 'antd'
import {
  DeleteOutlined, EditOutlined, PlusOutlined, LoadingOutlined, SyncOutlined, EyeOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
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
                      <div>{hoganIntegrationDetails.provider}</div>
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
                        <div>{mettlIntegrationDetails.completionWebhookUrl}</div>
                        <div>{mettlIntegrationDetails.resultsWebhookUrl}</div>
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
                        <div>{skillvueIntegrationDetails.completionWebhookUrl}</div>
                        <div>{skillvueIntegrationDetails.resultsWebhookUrl}</div>
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
                        <div>{iihtIntegrationDetails.webhookUrl}</div>
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
                        <span>{yoodliIntegrationDetails.platformId}</span>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.client_id')}
                          :
                        </b>
                        {' '}
                        <span>{yoodliIntegrationDetails.clientId}</span>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.deployment_id')}
                          :
                        </b>
                        {' '}
                        <span>{yoodliIntegrationDetails.deploymentId}</span>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_public_keyset_url')}
                          :
                        </b>
                        {' '}
                        <span>{yoodliIntegrationDetails.platformPublicKeysetUrl}</span>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_access_token_url')}
                          :
                        </b>
                        {' '}
                        <span>{yoodliIntegrationDetails.platformAccessTokenUrl}</span>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_authentication_request_url')}
                          :
                        </b>
                        {' '}
                        <span>{yoodliIntegrationDetails.platformAuthenticationRequestUrl}</span>
                      </div>
                      <div>
                        <b>
                          {I18n.t('administration.integrations.details.platform_host_name')}
                          :
                        </b>
                        {' '}
                        <span>{yoodliIntegrationDetails.platformHostName}</span>
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
                  {integration.name === 'yoodli' && (
                    <Tooltip title={I18n.t('administration.integrations.yoodli_assessments.manage_catalog')}>
                      <EyeOutlined onClick={() => handleTabChange('integrations/yoodli_assessments')} />
                    </Tooltip>
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
