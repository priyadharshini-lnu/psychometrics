
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Radio, Space, Switch } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { LicenseUsage, LicenseUsageTR } from '~/modules/admin/modules/client/core/license_usages'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const LicenseUsageComponent: React.FC<Props> = () => {
  const { clientId } = useParams<{ clientId: string }>()
  const { licenseId } = useParams<{ licenseId: string }>()

  const config = {
    trackUrl: true,
    responseType: LicenseUsageTR,
    basePath: `clients/${clientId}/licenses/${licenseId}`,
    apiConfig: {
      include: ['user', 'status_updated_by'],
      include_meta: ['permissions'],
      fields: { users: ['id', 'name'] },
    },
  }

  return (
    <>
      <Resource config={config} name="license_usages">
        <Filter />
        <Resource.Table pagination>
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.usage_id')}
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
            sorter
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.subject_name')}
            id="subject_name"
            dataIndex={['extras', 'subjectName']}
            sorter
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.subject_email')}
            id="subject_email"
            dataIndex={['extras', 'subjectEmail']}
            sorter
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('common.column.created_at')}
            id="created_at"
            dataIndex="createdAt"
            sorter
            render={createdAt => (
              moment(createdAt).format('lll')
            )}
          />
          <Resource.Column<LicenseUsage>
            title={I18n.t('license_usage.status_updated_at')}
            id="status_updated_at"
            dataIndex="statusUpdatedAt"
            sorter
            render={statusUpdatedAt => (
              statusUpdatedAt ? moment(statusUpdatedAt).format('lll') : null
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
          method: 'patch', // TODO: investigate, launching POST instead of PATCH/PUT
          updateStore: true,
        })
      }}
    />
  )
}

const Filter = () => {
  const { resource } = useResourceContext<LicenseUsage>()

  const toggleStatusFilter = () => {
    const newStatus = resource.getFilteredValue('status_eq') === 'active' ? 'inactive' : 'active'
    resource.changeFilter('status_eq', newStatus)
  }

  return (
    <Resource.Filter placeholder="Search" name="subject_name_or_subject_email_or_campaign_name_cont">
      <Space>
        <Radio.Group
          onChange={toggleStatusFilter}
          value={resource.getFilteredValue('statusEq')}
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
export const LicenseUsageList = connecter(LicenseUsageComponent)
