import _ from 'lodash'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col,
  Table,
  message,
} from 'antd'
import * as t from 'io-ts'
import { DateRangeSelectorModal } from '~/modules/admin/components/DateRangeSelectorModal'
import dayjs from '~/utils/dayjs'
import { useResources } from '~/hooks/useResources'
import {
  ProjectAdmin, AdminListingTR,
} from '~/modules/admin/modules/client/core/admin'
import { Meta } from '~/modules/admin/modules/Admins'
import { AdminTypes, CampaignTypes } from '~/modules/admin/modules/Admins/constants'
import { ActionsMenu } from './ActionsMenu'
import { getCampaignId } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

import { RootState } from '~/modules/admin/core/rootReducers'

const connector = connect(
  (state: RootState) => ({
    currentCampaignId: getCampaignId(state),
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  adminType: string
  campaignType?: string
}

type Props = PropsFromRedux & OwnProps

type ExportBody = {
  clientId: string;
  projectId: string;
  campaignId: string | number | undefined;
  startDate?: string;
  endDate?: string;
};

const { I18n } = window
const DATE_FORMAT = 'YYYY-MM-DD'

const exportDataTypes = {
  adminPermissions: 'admin_permissions',
  userReportEvents: 'user_report_events',
}

const DataExportsComponent:FC<Props> = ({
  adminType, campaignType, currentCampaignId,
}) => {
  const {
    projectId,
    clientId,
    campaignId: campaignIdParam,
  } = useParams() as { campaignId: string; projectId: string; clientId: string }
  const [showDateModal, setShowDateModal] = useState(false)
  const campaignId = campaignType === CampaignTypes.common ? campaignIdParam : currentCampaignId
  const today = dayjs()
  const oneWeekBack = today.subtract(7, 'days').startOf('day')

  const initialRange: [dayjs.Dayjs, dayjs.Dayjs] = [oneWeekBack, today.endOf('day')]

  const disabledDate = (current, range) => {
    if (current.isAfter(today.endOf('day'))) return true

    if (range[1] && current.isBefore(range[1].subtract(3, 'month').startOf('day'))) return true
    if (range[0] && current.isAfter(range[0].add(3, 'month').endOf('day'))) return true

    return false
  }

  const dataSource = [
    {
      key: '1',
      name: I18n.t('admin.export_admins_with_permissions'),
      dataType: exportDataTypes.adminPermissions,
    },
    {
      key: '2',
      name: I18n.t('admin.user_report_events'),
      dataType: exportDataTypes.userReportEvents,
    },
  ]

  const filterHash = {
    with_role: adminType,
    project_id_eq: projectId,
  }

  if (adminType === AdminTypes.CampaignAdmin) {
    _.merge(filterHash, { campaign_id_eq: campaignId })
  } else if (adminType === AdminTypes.ClientAdmin) {
    _.merge(filterHash, { client_id_eq: clientId })
  }

  const {
    isLoading: isAdminPermissionsLoading,
    meta: adminPermissionsMeta, collectionAction: exportAdminPermissions, fetch,
  } = useResources<ProjectAdmin, Meta>(
    'memberships',
    {
      trackUrl: true,
      responseType: AdminListingTR,
      apiConfig: {
        filter: filterHash,
        fields: {
          memberships: ['first_name', 'last_name', 'email', 'created_at', 'user_id'],
        },
      },
    },
  )

  const {
    isLoading: isUserReportEventsLoading,
    fetch: fetchUserReportEvents,
    meta: userReportEventsMeta,
    collectionAction: exportUserReportEvents,
  } = useResources('user_report_events',
    { apiConfig: { query: { project_id: projectId, campaign_id: campaignId, client_id: clientId } } })

  useEffect(() => {
    fetchUserReportEvents()
    fetch()
  }, [])

  const handleDataDownload = (id) => {
    if (id === exportDataTypes.userReportEvents) {
      setShowDateModal(true)
      return
    }

    const body: ExportBody = {
      clientId,
      projectId,
      campaignId,
    }

    exportAdminPermissions({
      action: 'export',
      method: 'post',
      body,
      responseType: t.literal('ok'),
    }).then(() => message.success(I18n.t('admin.export_success')))
  }

  const handleUserReportEventDownload = (startDate, endDate) => {
    if (!startDate || !endDate) return
    const body: ExportBody = {
      clientId,
      projectId,
      campaignId,
      startDate: startDate.format(DATE_FORMAT),
      endDate: endDate.format(DATE_FORMAT),
    }

    exportUserReportEvents({
      action: 'export',
      method: 'post',
      body,
      responseType: t.literal('ok'),
    }).then(() => {
      setShowDateModal(false)
      message.success(I18n.t('admin.export_success'))
    })
  }

  const columns = [
    {
      title: I18n.t('shared.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: I18n.t('shared.action'),
      dataIndex: 'dataType',
      key: 'actions',
      render: value => (
        <ActionsMenu
          id={value}
          permissions={{
            [exportDataTypes.userReportEvents]: userReportEventsMeta.permissions,
            [exportDataTypes.adminPermissions]: adminPermissionsMeta.permissions,
          }}
          onDownload={handleDataDownload}
        />
      ),
    },
  ]

  return (
    <>
      <Row>
        <Col span={24}>
          <Table
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={dataSource}
            columns={columns}
            loading={(isUserReportEventsLoading('fetch') || isAdminPermissionsLoading('fetch'))}
          />
          <DateRangeSelectorModal
            onDownload={handleUserReportEventDownload}
            onCancel={() => setShowDateModal(false)}
            open={showDateModal}
            disabledDate={disabledDate}
            showTime={false}
            dateFormat={DATE_FORMAT}
            initialRange={initialRange}
            modalTitle={I18n.t('admin.data_exports_modal_title')}
          />
        </Col>
      </Row>
    </>
  )
}

export const DataExports = connector(DataExportsComponent)
