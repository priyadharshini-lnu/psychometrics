import { useState } from 'react'
import { Radio } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { SmsInvitesTable } from './SmsInvitesTable'
import { SmsHistoriesList } from './SmsHistoriesList'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'

const { I18n } = window

export const SmsInvites = () => {
  const { campaignId, tab } = useParams() as { campaignId: string, tab: string }
  const [currentTab, setTab] = useState(tab || 'invites')

  const navigate = useNavigate()
  const prefixPath = `${settings.urlPrefix}/${campaignId}/participants/sms`
  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(navigate, prefixPath, `/${currentTab}`)
    setTab(currentTab)
  }

  const toggle = (
    <Radio.Group onChange={e => handleTabChange(e.target.value)} value={currentTab}>
      <Radio.Button value="invites">{I18n.t('admin.sms_invites_contacts')}</Radio.Button>
      <Radio.Button value="history">{I18n.t('admin.sms_histories_history')}</Radio.Button>
    </Radio.Group>
  )

  return (
    <div>
      {currentTab === 'invites' && <SmsInvitesTable toggle={toggle} />}
      {currentTab === 'history' && <SmsHistoriesList toggle={toggle} />}
    </div>
  )
}
