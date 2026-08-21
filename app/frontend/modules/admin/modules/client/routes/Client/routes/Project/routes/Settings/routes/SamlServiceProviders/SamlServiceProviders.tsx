import React, { useEffect } from 'react'
import {
  Table, Space, Input, Switch, Pagination, Button, MenuProps, App,
  Typography, Tag,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import { UpdateResource, BaseMeta } from '~/hooks/useResources/interfaces'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentUser } from '~/core/currentUser'
import { SamlServiceProvider, SamlServiceProviderTR } from '~/modules/admin/modules/client/core/samlServiceProviders'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { AddEditSamlServiceProviderModal } from './AddEditSamlServiceProviderModal/AddEditSamlServiceProviderModal'
import { useWindowSize } from '~/hooks/useWindowSize'

const MODALS = {
  AddEditSamlServiceProviderModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { I18n } = window
const { Column } = Table

const SamlServiceProvidersListComponent: React.FC<Props> = ({ openModal }) => {
  const { projectId } = useParams() as { projectId: string }

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, createResource, updateResource,
    requests, removeResource, memberAction,
  } = useResources<SamlServiceProvider, BaseMeta>(
    'saml_service_providers',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      responseType: SamlServiceProviderTR,
    },
  )
  const { modal, message } = App.useApp()
  const { width: windowWidth } = useWindowSize()

  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const toggleActive = (saml_service_provider) => {
    updateResource({
      id: saml_service_provider.id,
      enabled: !saml_service_provider.enabled,
    })
  }

  const removeSamlServiceProvider = (saml_service_provider) => {
    modal.confirm({
      title: I18n.t('admin.saml_service_provider_remove_title'),
      content: I18n.t(
        'admin.saml_service_provider_remove_content',
        {
          name: saml_service_provider.name,
        },
      ),
      okText: I18n.t('admin.delete_ok_text'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        removeResource(`${saml_service_provider.id}`).then(() => {
          message.success(I18n.t('admin.saml_service_provider_delete_success'))
          close()
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  const rotateCertificate = (saml_service_provider) => {
    modal.confirm({
      title: I18n.t('admin.saml_service_provider_rotate_certificate_title'),
      content: I18n.t(
        'admin.saml_service_provider_rotate_certificate_content',
        {
          name: saml_service_provider.name,
        },
      ),
      okText: I18n.t('admin.saml_service_provider_rotate_certificate_ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        memberAction({
          id: saml_service_provider.id,
          action: 'rotate_certificate',
          method: 'post',
        }).then(() => {
          message.success(I18n.t('admin.saml_service_provider_rotate_certificate_success'))
          fetch()
        }).catch(() => {
          message.error(I18n.t('admin.saml_service_provider_rotate_certificate_error'))
        })
      },
    })
  }

  const SamlServiceProvidersTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          fixed={windowWidth > 800 ? 'left' : undefined}
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          key="enabled"
          title={I18n.t('admin.saml_service_provider_enabled')}
          render={saml_service_provider => (
            <Switch
              checked={saml_service_provider.enabled}
              onChange={() => toggleActive(saml_service_provider)}
            />
          )}
        />
        <Column
          key="integration_type"
          title={I18n.t('admin.saml_service_provider_integration_type')}
          render={saml_service_provider => (
            <span>{I18n.t(`admin.saml_service_provider_integration_${saml_service_provider.integrationType}`)}</span>
          )}
        />
        <Column
          key="mask_identity"
          title={I18n.t('admin.saml_service_provider_mask_identity')}
          render={(saml_service_provider) => {
            const isGeneric = saml_service_provider.integrationType === 'generic'

            if (isGeneric) {
              return saml_service_provider.maskIdentity ? (
                <Tag color="blue">{I18n.t('admin.saml_service_provider_masking_manual_enabled')}</Tag>
              ) : (
                <Tag color="default">{I18n.t('admin.saml_service_provider_masking_manual_disabled')}</Tag>
              )
            }

            return (
              <Tag color="orange">
                {I18n.t(
                  'admin.saml_service_provider_masking_integration',
                  { integration: saml_service_provider.integrationType },
                )}
              </Tag>
            )
          }}
        />
        <Column
          key="name"
          title={I18n.t('shared.name')}
          dataIndex="name"
          sorter
          sortOrder={getSortOrder('name')}
        />
        <Column
          key="entity_id"
          dataIndex="entityId"
          title={I18n.t('admin.saml_service_provider_entity_id')}
          sorter
          sortOrder={getSortOrder('entity_id')}
        />
        <Column
          key="acs_urls"
          title={I18n.t('admin.saml_service_provider_acs_urls')}
          render={saml_service_provider => (
            <ul className="m0 pl16">
              {saml_service_provider.acsUrls?.map((url, index) => (
                <li key={index} className="mb4">
                  <Typography.Text>
                    {url}
                  </Typography.Text>
                </li>
              ))}
            </ul>
          )}
        />
        <Column
          key="idp_configuration"
          title={I18n.t('admin.saml_service_provider_idp_config')}
          render={saml_service_provider => (
            <Space orientation="vertical" size="small" className="w-100">
              <div>
                <Typography.Text strong>
                  {I18n.t('admin.saml_idp_entity_id_label')}
                  :
                </Typography.Text>
                <br />
                <Typography.Text
                  copyable={{ text: saml_service_provider.issuerUri }}
                >
                  {saml_service_provider.issuerUri}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text strong>
                  {I18n.t('admin.saml_idp_sso_url_label')}
                  :
                </Typography.Text>
                <br />
                <Typography.Text
                  copyable={{ text: saml_service_provider.ssoServiceUrl }}
                >
                  {saml_service_provider.ssoServiceUrl}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text strong>
                  {I18n.t('admin.saml_idp_certificate_label')}
                  :
                </Typography.Text>
                <br />
                <Typography.Text
                  copyable={{ text: saml_service_provider.idpCertificate }}
                >
                  {I18n.t('admin.saml_idp_certificate_available')}
                </Typography.Text>
              </div>
            </Space>
          )}
        />
        <Column
          title={I18n.t('admin.saml_service_provider_updated_date')}
          key="updated_at"
          dataIndex="updatedAt"
          sorter
          sortOrder={getSortOrder('updated_at')}
        />
        <Column
          key="manage"
          fixed={windowWidth > 800 ? 'right' : undefined}
          title={I18n.t('admin.saml_service_provider_manage')}
          render={saml_service_provider => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  saml_service_provider,
                  removeSamlServiceProvider,
                  rotateCertificate,
                  updateSamlServiceProvider: updateResource,
                  openModal,
                })
              }
            />
          )}
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
      />
    </>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t('admin.saml_service_provider_search')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      <Button
        icon={<PlusOutlined />}
        type="primary"
        disabled={tableLoading}
        onClick={() => {
          openModal(
            'AddEditSamlServiceProviderModal',
            {
              addSamlServiceProvider: createResource,
              updateSamlServiceProvider: updateResource,
              saml_service_provider: null,
            },
          )
        }}
      >
        {I18n.t('admin.saml_service_provider_add')}
      </Button>
    </Space>
  )

  return (
    <>
      <TableLayout
        table={SamlServiceProvidersTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
      />
      <Modals modals={MODALS} />
    </>
  )
}

interface ActionMenuData {
  saml_service_provider: SamlServiceProvider,
  removeSamlServiceProvider(saml_service_provider: SamlServiceProvider): void
  rotateCertificate(saml_service_provider: SamlServiceProvider): void
  updateSamlServiceProvider: UpdateResource<SamlServiceProvider>
  openModal(name: string, data?: {
    saml_service_provider: SamlServiceProvider,
    projectId?: number,
    updateSamlServiceProvider?: UpdateResource<SamlServiceProvider>,
    isEditMode?: boolean
    testMode?: boolean
  })
}

const getActionsMenuProps = ({
  saml_service_provider, removeSamlServiceProvider, rotateCertificate, openModal, updateSamlServiceProvider,
}:ActionMenuData):MenuProps => {
  const menuItems: MenuItem[] = [
    {
      key: 'edit',
      label: I18n.t('admin.saml_service_provider_action_edit_label'),
    },
    saml_service_provider.enabled && {
      key: 'download_xml',
      label: I18n.t('admin.saml_service_provider_action_download_xml_label'),
    },
    {
      key: 'rotate_certificate',
      label: I18n.t('admin.saml_service_provider_action_rotate_certificate_label'),
    },
    {
      key: 'delete',
      label: I18n.t('shared.delete'),
    },
  ] as MenuItem[]

  const handleMenuClick = ({ key }) => {
    if (key === 'delete') {
      removeSamlServiceProvider(saml_service_provider)
    }
    if (key === 'edit') {
      openModal(
        'AddEditSamlServiceProviderModal', {
          updateSamlServiceProvider,
          saml_service_provider,
        },
      )
    }
    if (key === 'download_xml') {
      window.location.href = saml_service_provider.issuerUri
    }
    if (key === 'rotate_certificate') {
      rotateCertificate(saml_service_provider)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const SamlServiceProviders = connecter(SamlServiceProvidersListComponent)
