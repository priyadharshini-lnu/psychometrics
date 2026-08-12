import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../components/MediaLibraryList')

const MediaLibraryRoutes = [
  {
    path: 'libraries/*',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default MediaLibraryRoutes
