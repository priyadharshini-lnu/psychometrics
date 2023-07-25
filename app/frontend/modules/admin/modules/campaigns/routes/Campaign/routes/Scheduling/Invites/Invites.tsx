import { useState } from 'react'
import { Radio } from 'antd'
import styles from './styles.less'
import { InvitesTable } from './InvitesTable'
import { RequestsTable } from './RequestsTable'

const { I18n } = window

export const Invites = () => {
  const [tab, setTab] = useState('invites')

  return (
    <div style={{ padding: 20 }}>
      <div className={styles.controls}>
        <Radio.Group onChange={e => setTab(e.target.value)} defaultValue={tab}>
          <Radio.Button value="invites">{I18n.t('workshop_invite.invites')}</Radio.Button>
          <Radio.Button value="requests">{I18n.t('workshop_invite.requests')}</Radio.Button>
        </Radio.Group>
      </div>
      {tab === 'invites' && <InvitesTable />}
      {tab === 'requests' && <RequestsTable />}
    </div>
  )
}
