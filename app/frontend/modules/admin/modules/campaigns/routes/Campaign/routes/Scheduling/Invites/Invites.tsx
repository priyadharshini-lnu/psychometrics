import { useState } from 'react'
import { Radio } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { InvitesTable } from './InvitesTable'
import { RequestsTable } from './RequestsTable'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'


const { I18n } = window

export const Invites = () => {
  const { campaignId, tab } = useParams() as { campaignId: string, tab: string }
  const [currentTab, setTab] = useState(tab || 'invites')
  const navigate = useNavigate()
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling`
  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(navigate, prefixPath, `/${currentTab}`)
    setTab(currentTab)
  }

  const toggle = (
    <Radio.Group onChange={e => handleTabChange(e.target.value)} value={currentTab}>
      <Radio.Button value="invites">{I18n.t('admin.invite_invites')}</Radio.Button>
      <Radio.Button value="requests">{I18n.t('admin.invite_requests')}</Radio.Button>
    </Radio.Group>
  )

  return (
    <div>
      {currentTab === 'invites' && <InvitesTable toggle={toggle} />}
      {currentTab === 'requests' && <RequestsTable toggle={toggle} />}
    </div>
  )
}
