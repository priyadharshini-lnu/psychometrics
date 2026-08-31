import { FC, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { DefaultAntThemeWrapper } from '~/glint'
import { GlintAdminTheme } from '~/components/AdminShell/GlintAdminTheme'
import { ImpersonationBanner } from '~/components/ImpersonationBanner'

// Only layouts/administration.html.slim gives the body this id; end-user and report layouts do not.
const isAdminLayout = () => document.body.id === 'administration'

const mount = () => {
  if (!window.PsyGlobalState?.impersonationData) return

  const container = document.getElementById('impersonation-banner-portal')
  if (!container) return

  const signOutPath = container.dataset.signOutPath || '/'

  // Marsh is admin-only for now; end-user and report pages keep the legacy antd defaults.
  const Theme: FC<{ children: ReactNode }> = isAdminLayout() ? GlintAdminTheme : DefaultAntThemeWrapper

  const root = createRoot(container)
  root.render(
    <Theme>
      <ImpersonationBanner signOutPath={signOutPath} />
    </Theme>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
