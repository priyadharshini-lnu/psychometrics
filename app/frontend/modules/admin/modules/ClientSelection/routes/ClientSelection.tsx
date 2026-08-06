import React, {
  useState, useRef, useEffect, useContext,
} from 'react'
import {
  Typography, Input, Row, Col, Empty, Layout, Flex, theme,
} from 'antd'
import { GlintThemeContext, TopBar, useApp } from '@thetalententerprise/glint'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import MarshLogo from '~/assets/marsh-logo.svg?react'
import { consumeBootNotice } from '~/components/AdminShell/bootNotices'
import { UserProfileDropdown } from '~/components/UserProfileDropdown'
import { ClientCard, ClientData } from './ClientCard'

const { Title, Text } = Typography
const { I18n } = window

const csrfToken = (): string => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

interface Props {
  clients: ClientData[]
  spoofUserId?: number | null
}

// The pattern's strokes are pale: loud over navy, all but erased over cream, so each scheme veils it differently.
const VEIL_OPACITY_DARK = 0.88
const VEIL_OPACITY_LIGHT = 0.35

// The mark is drawn in currentColor, so the link carries the same brand colour the shell picks.
const Brand: React.FC = () => {
  const { token } = theme.useToken()
  const { mode } = useContext(GlintThemeContext)

  return (
    <a href="/admin" style={{ display: 'flex', color: mode === 'dark' ? 'var(--white-bg)' : 'var(--brand-navy)' }}>
      <MarshLogo
        role="img"
        aria-label={I18n.t('admin.lighthouse_logo_alt_text')}
        style={{ display: 'block', blockSize: token.controlHeight, inlineSize: 'auto' }}
      />
    </a>
  )
}

export const ClientSelection: React.FC<Props> = ({ clients, spoofUserId }) => {
  const { token } = theme.useToken()
  const { mode } = useContext(GlintThemeContext)
  const { message } = useApp()
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

  // The layout paints the splash before boot and renders no flash; only this page can clear and replace them.
  useEffect(() => {
    document.getElementById('admin-splash')?.remove()
    const notice = consumeBootNotice()
    if (notice) message[notice.type](I18n.t(notice.i18nKey))
  }, [message])

  return (
    // antd scopes the Layout token vars to .ant-layout, so the header only resolves headerBg inside a Layout.
    <Layout style={{ background: 'transparent' }}>
      {/* Only this shell page carries content over the backdrop, so only it veils the pattern down. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: token.colorBgLayout,
          opacity: mode === 'dark' ? VEIL_OPACITY_DARK : VEIL_OPACITY_LIGHT,
        }}
      />
      <TopBar start={<Brand />} end={<UserProfileDropdown hideProfileLinks />} />
      <Layout.Content>
        <div style={{ maxInlineSize: token.screenLG, marginInline: 'auto', padding: token.paddingLG }}>
          <div
            style={{
              marginBlockEnd: token.marginLG,
              paddingBlockEnd: token.margin,
              borderBlockEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorder}`,
            }}
          >
            <Row align="middle" gutter={[token.marginLG, token.margin]}>
              <Col xs={24} md={12}>
                <Flex vertical gap={token.marginXXS}>
                  <Title level={3} style={{ marginBlock: 0 }}>{I18n.t('admin.clients')}</Title>
                  <Text type="secondary">{I18n.t('admin.client_selection_instruction')}</Text>
                </Flex>
              </Col>
              <Col xs={24} md={12}>
                <Input
                  placeholder={I18n.t('admin.clients_search_placeholder')}
                  prefix={<SearchOutlined />}
                  size="large"
                  allowClear
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </Col>
            </Row>
          </div>
          {filteredClients.length > 0 ? (
            <Row gutter={[token.marginLG, token.marginMD]}>
              {filteredClients.map(client => (
                <Col xs={24} sm={12} lg={8} key={client.id}>
                  <ClientCard client={client} onSelect={setSelectedClientId} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description={I18n.t('admin.no_clients_found')} />
          )}
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
      </Layout.Content>
    </Layout>
  )
}
