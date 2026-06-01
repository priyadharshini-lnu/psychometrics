import React, { useState, useRef, useEffect } from 'react'
import {
  Typography, Input, Row, Col, Empty,
} from 'antd'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import lighthouseLogo from '~/modules/endUser/assets/images/lighthouseLogoWideNew.svg'
import { UserProfileDropdown } from '~/components/UserProfileDropdown'
import { ClientCard, ClientData } from './ClientCard'
import styles from './styles.less'

const { Title, Paragraph } = Typography
const { I18n } = window

const csrfToken = (): string => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

interface Props {
  clients: ClientData[]
  spoofUserId?: number | null
}

export const ClientSelection: React.FC<Props> = ({ clients, spoofUserId }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const filteredClients = clients
    .filter(
      client => client.name.toLowerCase().includes(searchTerm.toLowerCase())
        || client.subdomain.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (selectedClientId && formRef.current) {
      formRef.current.submit()
    }
  }, [selectedClientId])

  return (
    <>
      <nav className={styles.topBar}>
        <a href="/admin">
          <img src={lighthouseLogo} alt={I18n.t('admin.lighthouse_logo_alt_text')} className={styles.logoImg} />
        </a>
        <UserProfileDropdown />
      </nav>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <Title level={3}>{I18n.t('admin.clients')}</Title>
            <Paragraph className={styles.description}>
              {I18n.t('admin.client_selection_instruction')}
            </Paragraph>
          </div>
          <Input
            placeholder={I18n.t('admin.clients_search_placeholder')}
            addonAfter={<SearchOutlined />}
            className={styles.searchInput}
            allowClear
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.scrollArea}>
          {filteredClients.length > 0 ? (
            <Row gutter={[24, 20]}>
              {filteredClients.map(client => (
                <Col xs={24} sm={12} lg={8} key={client.id}>
                  <ClientCard client={client} onSelect={setSelectedClientId} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description={I18n.t('admin.no_clients_found')} />
          )}
        </div>
        <form
          ref={formRef}
          action="/administration/select_client"
          method="post"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="authenticity_token" value={csrfToken()} />
          <input type="hidden" name="client_id" value={selectedClientId || ''} />
          {spoofUserId && <input type="hidden" name="spoof_user_id" value={spoofUserId} />}
        </form>
      </div>
    </>
  )
}
