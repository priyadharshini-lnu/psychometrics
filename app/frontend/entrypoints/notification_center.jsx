import { createRoot } from 'react-dom/client'

import NotificationCenter from '~/components/NotificationCenter'

const root = createRoot(document.getElementById('notification-center-container'))
root.render(<NotificationCenter />)
