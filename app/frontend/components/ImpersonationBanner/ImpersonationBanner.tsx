import React, { useEffect } from 'react'
import { Alert, Typography, Button } from 'antd'
import { WarningFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { ExitIcon } from '~/glint/icons'
import styles from './ImpersonationBanner.less'

const { I18n } = window
const { Text } = Typography

interface Props {
  signOutPath: string
}

const bannerStyle: React.CSSProperties = {
  backgroundColor: '#CF1322',
  border: 'none',
  height: '40px',
  padding: '0 0 0 16px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
}

const exitButtonStyle: React.CSSProperties = {
  height: '40px',
  borderRadius: 0,
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  margin: 0,
  color: '#fff',
  fontWeight: 500,
}

const ImpersonationBanner: React.FC<Props> = ({ signOutPath }) => {
  const { impersonationData } = window.PsyGlobalState || {}

  useEffect(() => {
    if (impersonationData) {
      document.body.classList.add('is-impersonating')
    }
    return () => {
      document.body.classList.remove('is-impersonating')
    }
  }, [impersonationData])

  if (!impersonationData) return null

  const { impersonator, target } = impersonationData

  return (
    <Alert
      className={styles.banner}
      style={bannerStyle}
      type="error"
      banner
      icon={<WarningFilled style={{ color: '#fff' }} />}
      message={(
        <Text style={{
          color: '#fff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
        }}
        >
          <Text strong style={{ color: '#fff' }}>{impersonator.name}</Text>
          {` (${impersonator.email}) `}
          <span style={{ fontWeight: 500 }}>{I18n.t('shared.is_impersonating')}</span>
          {' '}
          <Text strong style={{ color: '#fff' }}>{target.role}</Text>
          {' '}
          <Text strong style={{ color: '#fff' }}>{target.name}</Text>
          {` (${target.email})`}
        </Text>
      )}
      action={(
        <Button
          type="text"
          href={signOutPath}
          className={styles.exitButton}
          icon={<ExitIcon />}
          style={exitButtonStyle}
        >
          {I18n.t('shared.impersonation_end_session')}
        </Button>
      )}
    />
  )
}

export { ImpersonationBanner }
