import { createRoot } from 'react-dom/client'
import { DefaultAntThemeWrapper } from '~/glint'
import { ImpersonationBanner } from '~/components/ImpersonationBanner'

const mount = () => {
  if (!window.PsyGlobalState?.impersonationData) return

  const container = document.getElementById('impersonation-banner-portal')
  if (!container) return

  const signOutPath = container.dataset.signOutPath || '/'

  const root = createRoot(container)
  root.render(
    <DefaultAntThemeWrapper>
      <ImpersonationBanner signOutPath={signOutPath} />
    </DefaultAntThemeWrapper>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
