import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Button, Table, Badge, Space, Tooltip, message,
} from 'antd'
import {
  DeleteOutlined, EditOutlined, PlusOutlined, LoadingOutlined, SyncOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import map from 'lodash/map'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get, fetch, remove, REMOVE, loadMettlAssessments,
} from '~/modules/admin/modules/client/core/integrations'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { isRequestInProgress } from '~/core/request'
import { IntegrationFormModal } from './IntegrationFormModal'


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
  isDeleteRequestInProgress,
}) => {
  const { projectId } = useParams() as { projectId: string }


  useEffect(() => {
    fetch(projectId)
  }, [])

  const handleMettlLoad = () => {
    loadMettlAssessments(projectId)
      .then(() => {
        message.success(I18n.t('administration.integrations.load_mettl_success'))
      })
  }

  const mettlIntegrationExists = integrations.some(integration => integration.name === 'mettl')


  return (
    <>
      <Row className="pl">
        <Col lg={14} md={17} sm={24}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="mb-4"
            style={{ marginRight: '10px' }}
            onClick={() => openModal('IntegrationFormModal')}
          >
            {I18n.t('administration.integrations.actions.add')}
          </Button>

          {mettlIntegrationExists && (
            <Button
              type="primary"
              className="mb-4"
              icon={<SyncOutlined />}
              onClick={handleMettlLoad}
            >
              {I18n.t('administration.integrations.actions.load_mettl_catalog')}
            </Button>
          )}

          <Table dataSource={integrations} pagination={false}>
            <Column
              title={I18n.t('common.column.status')}
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
              render={({ name, details, provider }) => {
                if (name === 'hogan') {
                  return (
                    <>
                      <b>
                        {I18n.t('administration.integrations.details.provider')}
                        :
                      </b>
                      <div>{provider}</div>
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
                        <div>{details.completionWebhookUrl}</div>
                        <div>{details.resultsWebhookUrl}</div>
                      </div>
                    </>
                  )
                }

                if (!details) { return null }

                return map(details, (value, key) => (
                  <>
                    <b>
                      {I18n.t(`administration.integrations.details.${key}`)}
                      :
                    </b>
                    <div>{value}</div>
                  </>
                ))
              }}
            />
            <Column
              title={I18n.t('common.column.action')}
              render={integration => (
                <Space size="middle">
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
