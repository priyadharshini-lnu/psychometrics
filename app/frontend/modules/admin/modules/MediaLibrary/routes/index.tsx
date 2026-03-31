import { lazy } from 'react'

const MediaLibraryList = lazy(() => import('../components/MediaLibraryList'))
const MediaLibraryRoutes = [
  {
    path: 'libraries/*',
    element: <MediaLibraryList />,
  },
]

export default MediaLibraryRoutes
