import React from 'react'
import { Card } from 'antd'
import clientIconSrc from '~/components/ClientSwitcher/client-icon.svg'
import styles from './styles.less'

const { I18n } = window

export interface ClientData {
  id: number
  name: string
  subdomain: string
  highest_role: string
  sso_enforced?: boolean
  logo_url?: string | null
}

interface Props {
  client: ClientData
  onSelect: (clientId: number) => void
}

export const ClientCard: React.FC<Props> = ({ client, onSelect }) => (
  <Card
    className={styles.clientCard}
    onClick={() => onSelect(client.id)}
  >
    {client.sso_enforced && (
      <span className={styles.ssoBadge}>{I18n.t('admin.sso_label')}</span>
    )}
    <div className={styles.cardContent}>
      {client.logo_url
        ? <img src={client.logo_url} alt={client.name} className={styles.clientLogo} />
        : <img src={clientIconSrc} alt="" className={styles.clientLogo} />}
      <p className={styles.clientName}>
        {client.name}
      </p>
      <p className={styles.subdomain}>
        {client.subdomain}
      </p>
    </div>
  </Card>
)
