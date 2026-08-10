import React, {
  useState, useRef, useEffect, useMemo,
} from 'react'
import {
  Dropdown, Input, Empty,
} from 'antd'
import DOMPurify from 'dompurify'
import { Icon } from '@thetalententerprise/glint/icons'
import {
  SwapOutlined, SearchOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './ClientSwitcher.less'

const { I18n } = window

interface ClientData {
  id: number
  name: string
  subdomain: string
  logo_url?: string | null
}

interface SwitchableClient {
  id: number
  name: string
  subdomain: string
  sso_enforced?: boolean
  has_active_session: boolean
  logo_url?: string | null
}

interface Props {
  currentClient: ClientData
  switchableClients: SwitchableClient[]
  recentClientIds: number[]
}

const csrfToken = (): string => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

const getSafeUrl = (url?: string | null) => {
  if (!url) return undefined
  try {
    const parsed = new URL(url, window.location.origin)
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) {
      return parsed.href
    }
  } catch {
    return undefined
  }
  return undefined
}

export const ClientSwitcher: React.FC<Props> = ({
  currentClient,
  switchableClients,
  recentClientIds,
}) => {
  const hasSwitchableClients = switchableClients.length > 1
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const switchFormRef = useRef<HTMLFormElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleScroll = () => {
    if (!isScrolling) setIsScrolling(true)
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 800)
  }

  useEffect(() => {
    if (selectedClientId && switchFormRef.current) {
      switchFormRef.current.submit()
    }
  }, [selectedClientId])

  const clientAvatar = (client: SwitchableClient) => {
    const safeUrl = getSafeUrl(client.logo_url)
    const sanitizedUrl = safeUrl ? DOMPurify.sanitize(safeUrl) : undefined
    return sanitizedUrl
      ? <img src={sanitizedUrl} alt={client.name} className={styles.menuAvatarImg} />
      : <Icon name="corporate_fare" className={styles.menuAvatarImg} />
  }

  const renderClientItem = (client: SwitchableClient) => (
    <div className={styles.menuItem}>
      <span className={styles.menuAvatar}>{clientAvatar(client)}</span>
      <span className={styles.menuItemContent}>
        <span className={styles.menuItemName}>{client.name}</span>
        <span className={styles.menuItemSubdomain}>{client.subdomain}</span>
      </span>
      {client.sso_enforced && (
        <span className={styles.ssoBadge}>{I18n.t('admin.sso_label')}</span>
      )}
      {client.has_active_session && (
        <span className={styles.statusDot} aria-label={I18n.t('admin.logged_in')} />
      )}
    </div>
  )

  const recentClients = useMemo(() => (
    recentClientIds
      .map(id => switchableClients.find(c => c.id === id))
      .filter((c): c is SwitchableClient => !!c && c.id !== currentClient.id)
  ), [recentClientIds, switchableClients, currentClient.id])

  const otherClients = useMemo(() => {
    const recentSet = new Set(recentClientIds)
    return switchableClients
      .filter(c => !recentSet.has(c.id) && c.id !== currentClient.id)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [switchableClients, recentClientIds, currentClient.id])

  const renderClientList = (clients: SwitchableClient[]) => clients.map(client => (
    <div
      key={client.id}
      className={styles.dropdownItem}
      role="button"
      tabIndex={0}
      onClick={() => setSelectedClientId(client.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedClientId(client.id) }
      }}
    >
      {renderClientItem(client)}
    </div>
  ))

  const renderSearchResults = () => {
    const query = searchQuery.toLowerCase().trim()
    const filtered = switchableClients
      .filter(c => c.id !== currentClient.id
        && (c.name.toLowerCase().includes(query) || c.subdomain.toLowerCase().includes(query)))
      .sort((a, b) => a.name.localeCompare(b.name))

    if (filtered.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={I18n.t('admin.no_clients_found')}
          style={{ padding: '16px 0' }}
        />
      )
    }
    return renderClientList(filtered)
  }

  const renderSections = () => (
    <>
      {recentClients.length > 0 && (
        <>
          <div className={styles.sectionHeader}>{I18n.t('admin.recents')}</div>
          {renderClientList(recentClients)}
        </>
      )}
      {otherClients.length > 0 && (
        <>
          <div className={styles.sectionHeader}>{I18n.t('admin.others')}</div>
          {renderClientList(otherClients)}
        </>
      )}
    </>
  )

  if (!hasSwitchableClients) {
    return (
      <div className={styles.staticTrigger}>
        <span className={styles.clientName}>{currentClient.name}</span>
      </div>
    )
  }

  const trigger = (
    <div className={styles.trigger}>
      <span className={styles.clientName}>{currentClient.name}</span>
      <SwapOutlined className={styles.caret} />
    </div>
  )

  return (
    <>
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        onOpenChange={(visible) => { if (!visible) setSearchQuery('') }}
        dropdownRender={() => (
          <div className={styles.dropdownWrapper}>
            <div
              className={`${styles.dropdownScroller} ${isScrolling ? styles.isScrolling : ''}`}
              onScroll={handleScroll}
            >
              <div className={styles.dropdownHeader}>
                {I18n.t('admin.switch_client')}
              </div>
              <div className={styles.searchWrapper}>
                <Input
                  placeholder={I18n.t('admin.clients_search_placeholder')}
                  addonAfter={<SearchOutlined />}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  allowClear
                />
              </div>
              {searchQuery ? renderSearchResults() : renderSections()}
            </div>
          </div>
        )}
      >
        {trigger}
      </Dropdown>
      <form
        ref={switchFormRef}
        action="/administration/switch_client"
        method="post"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="authenticity_token" value={csrfToken()} />
        <input type="hidden" name="client_id" value={selectedClientId || ''} />
      </form>
    </>
  )
}
