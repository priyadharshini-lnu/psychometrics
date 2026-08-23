import { ReactNode, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, MenuProps } from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import {
  SmsHistoryTR, SmsHistory,
} from '~/modules/admin/modules/campaigns/core/smsHistories'
import { DetailsDrawer } from './DetailsDrawer'

const { I18n } = window

export const SmsHistoriesList: React.FC<{ toggle?: ReactNode }> = ({ toggle }) => {
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
      <Resource
        title={I18n.t('admin.participants_tabs_sms_contacts')}
        config={config}
        name="sms_histories"
        settingsKey={TABLE_SETTINGS_KEYS.campaignParticipantsSmsContacts}
      >
        <Resource.Filter
          placeholder={I18n.t('common.actions.search')}
          name="filterable_fields"
          controls={toggle}
        />

        <Resource.Table pagination>
          <Resource.Column<SmsHistory>
            title={I18n.t('common.column.id')}
            id="id"
            hideable={false}
            sorter
            dataIndex="id"
            width={100}
            fixed="left"
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('admin.sms_histories_columns_mobile_no')}
            id="mobileNo"
            dataIndex="mobileNo"
            minWidth={100}
            fixed="left"
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('shared.first_name')}
            id="firstName"
            dataIndex="firstName"
            sorter
            minWidth={100}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('shared.last_name')}
            id="lastName"
            dataIndex="lastName"
            sorter
            minWidth={100}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('admin.sms_histories_columns_segment_length')}
            id="segmentLength"
            dataIndex="segmentLength"
            minWidth={100}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('admin.sms_histories_columns_price')}
            id="price"
            dataIndex="price"
            render={price => I18n.toCurrency(price)}
            minWidth={100}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('admin.sms_histories_columns_sent_at')}
            id="createdAt"
            dataIndex="createdAt"
            sorter
            minWidth={100}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('shared.status')}
            id="status"
            render={({ status }) => I18n.t(`admin.sms_histories_statuses_${status}`)}
            minWidth={100}
          />
          <Resource.Column<SmsHistory>
            title={I18n.t('shared.action')}
            id="action"
            hideable={false}
            render={(_, smsHistory: SmsHistory) => (
              <Dropdown
                smsHistory={smsHistory}
                openDrawer={openDrawer}
              />
            )}
            width={100}
            fixed="right"
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
