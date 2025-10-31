
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Radio, Space, Switch } from 'antd'
import dayjs from '~/utils/dayjs'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { LicenseUsage, LicenseUsageTR } from '~/modules/admin/modules/client/core/license_usages'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const LicenseUsageComponent: React.FC<Props> = () => {
  const { projectId, licenseId } = useParams() as { projectId: string, licenseId: string}

  const config = {
    trackUrl: true,
    responseType: LicenseUsageTR,
    basePath: `projects/${projectId}/licenses/${licenseId}`,
    apiConfig: {
      include: ['user', 'status_updated_by'],
      include_meta: ['permissions', 'report_family_name'],
    },
  }

  return (
    <>
      <Resource config={config} name="license_usages">
        <BreadcrumbsComponent />
        <Filter />
        <Resource.Table pagination>
          <Resource.Column<LicenseUsage>
            title={I18n.t('common.column.id')}
            id="id"
            dataIndex="id"
            sorter
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.active')}
            id="status"
            dataIndex="status"
            render={(_, licenseUsage) => <ActiveSwitch licenseUsage={licenseUsage} />}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.campaign_name')}
            id="campaign_name"
            dataIndex={['extras', 'campaignName']}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.subject_name')}
            id="subject_name"
            dataIndex={['extras', 'subjectName']}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.subject_email')}
            id="subject_email"
            dataIndex={['extras', 'subjectEmail']}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('common.column.created_at')}
            id="created_at"
            dataIndex="createdAt"
            sorter
            render={createdAt => (
              dayjs(createdAt).format('lll')
            )}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.status_updated_at')}
            id="status_updated_at"
            dataIndex="statusUpdatedAt"
            sorter
            render={statusUpdatedAt => (
              statusUpdatedAt ? dayjs(statusUpdatedAt).format('lll') : null
            )}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.status_updated_by')}
            id="status_updated_by_id"
            dataIndex={['statusUpdatedBy', 'name']}
          />
        </Resource.Table>
      </Resource>
    </>
  )
}

const BreadcrumbsComponent = () => {
  const { resource } = useResourceContext<LicenseUsage>()
  const { clientId } = useParams() as { clientId: string }

  return (
    <Breadcrumb
      request={{
        fields: ['client'],
        data: {
          clientId: parseInt(clientId, 10),
        },
      }}
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('administration.clients.tenancies'),
        },
        {
          link: () => `/admin/clients/${clientId}/projects`,
          label: state => state.client.name,
        },
        {
          link: () => `/admin/clients/${clientId}/licenses`,
          label: () => I18n.t('administration.breadcrumbs.licenses'),
        },
        {
          label: () => resource.meta?.reportFamilyName || I18n.t('license_usage.usages'),
        },
      ]}
    />
  )
}

const ActiveSwitch: React.FC<{ licenseUsage: LicenseUsage }> = ({ licenseUsage }) => {
  const { resource } = useResourceContext<LicenseUsage>()

  return (
    <Switch
      disabled={!resource.meta.permissions?.toggleStatus}
      checked={licenseUsage.status === 'active'}
      onChange={() => {
        resource.memberAction({
          id: licenseUsage.id,
          action: 'toggle_status',
          method: 'patch',
          updateStore: true,
        })
      }}
    />
  )
}

const Filter = () => {
  const { resource } = useResourceContext<LicenseUsage>()

  const toggleStatusFilter = (e) => {
    resource.changeFilter('status_eq', e.target.value)
  }

  return (
    <Resource.Filter
      placeholder={I18n.t('common.actions.search')}
      name="subject_name_or_subject_email_or_campaign_name_cont"
    >
      <Space>
        <Radio.Group
          onChange={toggleStatusFilter}
        >
          <Radio.Button value="active">
            {I18n.t('license_usage.active')}
          </Radio.Button>
          <Radio.Button value="inactive">
            {I18n.t('license_usage.inactive')}
          </Radio.Button>
        </Radio.Group>
      </Space>
    </Resource.Filter>
  )
}
export default connecter(LicenseUsageComponent)
