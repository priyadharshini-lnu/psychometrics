import React from 'react'
import {
  Card, Flex, Tag, Typography, theme,
} from 'antd'
import { CorporateFare } from '@thetalententerprise/glint/icons'

const { Text } = Typography
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

export const ClientCard: React.FC<Props> = ({ client, onSelect }) => {
  const { token } = theme.useToken()
  const iconSize: React.CSSProperties = {
    blockSize: token.controlHeightLG,
    inlineSize: token.controlHeightLG,
    objectFit: 'contain',
  }

  return (
    <Card
      hoverable
      onClick={() => onSelect(client.id)}
      // The default colorBorderSecondary is a divider weight; the brand backdrop needs a stated edge.
      style={{ position: 'relative', blockSize: '100%', borderColor: token.colorBorder }}
      styles={{ body: { paddingBlock: token.paddingXL } }}
    >
      {client.sso_enforced && (
        <Tag
          style={{
            position: 'absolute',
            insetBlockStart: token.marginXS,
            insetInlineEnd: token.marginXS,
            marginInlineEnd: 0,
          }}
        >
          {I18n.t('admin.sso_label')}
        </Tag>
      )}
      <Flex vertical gap={token.marginXS} style={{ textAlign: 'center' }}>
        <Flex justify="center">
          {client.logo_url
            ? <img src={client.logo_url} alt={client.name} style={iconSize} />
            : <CorporateFare size={token.controlHeightLG} />}
        </Flex>
        <Text strong ellipsis style={{ fontSize: token.fontSizeLG }}>{client.name}</Text>
        <Text type="secondary" ellipsis>{client.subdomain}</Text>
      </Flex>
    </Card>
  )
}
