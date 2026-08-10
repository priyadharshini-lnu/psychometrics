import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('mediaLibrary', () => import('../components/MediaLibraryList'))

const MediaLibraryList = page(m => m.default)

const MediaLibraryRoutes = [
  {
    path: 'libraries/*',
    element: <MediaLibraryList />,
  },
]

export default MediaLibraryRoutes
