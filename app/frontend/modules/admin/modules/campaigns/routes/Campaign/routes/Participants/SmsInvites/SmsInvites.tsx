import { useState } from 'react'
import { Radio } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { SmsInvitesTable } from './SmsInvitesTable'
import { SmsHistoriesList } from './SmsHistoriesList'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'
import styles from './styles.less'

const { I18n } = window

export const SmsInvites = () => {
  const { campaignId, tab } = useParams<{ campaignId: string, tab: string }>()
  const [currentTab, setTab] = useState(tab || 'invites')

  const history = useHistory()
  const prefixPath = `${settings.urlPrefix}/${campaignId}/participants/sms`
  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(history, prefixPath, `/${currentTab}`)
    setTab(currentTab)
  }

  return (
    <div style={{ padding: 20 }}>
      <div className={styles.controls}>
        <Radio.Group onChange={e => handleTabChange(e.target.value)} defaultValue={currentTab}>
          <Radio.Button value="invites">{I18n.t('administration.sms_invites.invite.invites')}</Radio.Button>
          <Radio.Button value="history">
            {I18n.t('administration.sms_histories.history')}
          </Radio.Button>
        </Radio.Group>
      </div>
      {currentTab === 'invites' && <SmsInvitesTable />}
      {currentTab === 'history' && <SmsHistoriesList />}
    </div>
  )
}
