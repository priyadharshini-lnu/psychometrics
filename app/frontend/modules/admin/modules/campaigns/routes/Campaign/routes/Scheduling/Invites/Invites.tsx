import { useState } from 'react'
import { Radio } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { InvitesTable } from './InvitesTable'
import { RequestsTable } from './RequestsTable'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'
import styles from './styles.less'


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

  return (
    <div style={{ padding: 20 }}>
      <div className={styles.controls}>
        <Radio.Group onChange={e => handleTabChange(e.target.value)} defaultValue={currentTab}>
          <Radio.Button value="invites">{I18n.t('admin.invite_invites')}</Radio.Button>
          <Radio.Button value="requests">{I18n.t('admin.invite_requests')}</Radio.Button>
        </Radio.Group>
      </div>
      {currentTab === 'invites' && <InvitesTable />}
      {currentTab === 'requests' && <RequestsTable />}
    </div>
  )
}
