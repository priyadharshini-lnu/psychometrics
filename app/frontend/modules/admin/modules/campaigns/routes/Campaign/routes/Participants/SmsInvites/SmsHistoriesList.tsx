import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, MenuProps } from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Resource } from '~/modules/admin/components/Resource'
import {
  SmsHistoryTR, SmsHistory,
} from '~/modules/admin/modules/campaigns/core/smsHistories'
import { DetailsDrawer } from './DetailsDrawer'

const { I18n } = window

export const SmsHistoriesList = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const [smsDetails, setSmsDetails] = useState<SmsHistory | undefined>()

  const config = {
    basePath: `campaigns/${campaignId}/`,
    trackUrl: true,
    responseType: SmsHistoryTR,
    apiConfig: {
      include: ['sms_record'],
    },
  }

  const openDrawer = (smsHistory: SmsHistory) => {
    setSmsDetails(smsHistory)
  }

  return (
    <>
      <Resource config={config} name="sms_histories">
        <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields" />

        <Resource.Table pagination>
          <Resource.Column<SmsHistory>
            title={I18n.t('common.column.id')}
            id="id"
            sorter
            dataIndex="id"
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('administration.sms_histories.columns.mobile_no')}
            id="mobileNo"
            dataIndex="mobileNo"
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('administration.sms_histories.columns.first_name')}
            id="firstName"
            dataIndex="firstName"
            sorter
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('administration.sms_histories.columns.last_name')}
            id="lastName"
            dataIndex="lastName"
            sorter
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('administration.sms_histories.columns.segment_length')}
            id="segmentLength"
            dataIndex="segmentLength"
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('administration.sms_histories.columns.price')}
            id="price"
            dataIndex="price"
            render={price => I18n.toCurrency(price)}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('administration.sms_histories.columns.sent_at')}
            id="createdAt"
            dataIndex="createdAt"
            sorter
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('common.column.status')}
            id="status"
            render={({ status }) => I18n.t(`administration.sms_histories.statuses.${status}`)}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('common.column.action')}
            id="action"
            render={(_, smsHistory: SmsHistory) => (
              <Dropdown
                smsHistory={smsHistory}
                openDrawer={openDrawer}
              />
            )}
            width={100}
          />
        </Resource.Table>
      </Resource>
      {!!smsDetails && (
        <DetailsDrawer
          close={() => setSmsDetails(undefined)}
          smsHistory={smsDetails}
        />
      )}
    </>
  )
}
type DropDownProps = {
  openDrawer: (smsHistory: SmsHistory) => void
  smsHistory: SmsHistory
}

const Dropdown: React.FC<DropDownProps> = (
  { smsHistory, openDrawer },
) => (
  <>
    <ConditionalDropdown
      menu={getActionsMenuProps({
        smsHistory, openDrawer,
      })}
    />
  </>
)

interface ActionMenuProps {
  smsHistory: SmsHistory
  openDrawer: (smsHistory: SmsHistory) => void
}

const getActionsMenuProps = ({ smsHistory, openDrawer }: ActionMenuProps): MenuProps => {
  const menuItems = [
    {
      key: 'details',
      label: (
        <Button type="link" onClick={() => openDrawer(smsHistory)} className="ps-0">
          {I18n.t('reports.actions.details')}
        </Button>),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
