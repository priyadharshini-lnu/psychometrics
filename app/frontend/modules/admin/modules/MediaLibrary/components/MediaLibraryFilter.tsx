import { Breadcrumb as AntBreadcrumb, Button } from 'antd'
import { PlusOutlined, UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { MediaLibrary } from '~/modules/admin/modules/client/core/libraries'
import { BaseMeta } from '~/hooks/useResources/interfaces'

const { I18n } = window

interface AncestorItem {
  id: string
  name: string
}

interface MediaLibraryMeta extends BaseMeta {
  ancestors?: AncestorItem[]
}

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
  }

export const MediaLibraryFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<MediaLibrary, MediaLibraryMeta>()

  const tableLoading = resource.isLoading('fetch')
  const ancestors: AncestorItem[] = resource.meta?.ancestors || []
  const isInsideFolder = ancestors.length > 0

  const navigateToFolder = (folderId: string | null) => {
    resource.changeUrlQuery({
      filter: folderId ? { with_parent: folderId } : undefined,
    })
  }

  const handleUpload = () => {
    openModal('MediaLibraryFormModal', {
      isUpload: true,
      modalTitle:
        I18n.t('admin.upload_media'),
    })
  }

  const breadcrumbItems = isInsideFolder
    ? [
      {
        title: (
          <a href="/admin" style={{ color: 'var(--grey-text)' }}>
            {I18n.t('admin.dashboard')}
          </a>
        ),
      },
      {
        title: (
          <a onClick={() => navigateToFolder(null)} style={{ color: 'var(--grey-text)' }}>
            {I18n.t('admin.media_library')}
          </a>
        ),
      },
      ...ancestors.slice(0, -1).map(ancestor => ({
        title: (
          <a onClick={() => navigateToFolder(ancestor.id)} style={{ color: 'var(--grey-text)' }}>
            {ancestor.name}
          </a>
        ),
      })),
      {
        title: ancestors[ancestors.length - 1]?.name,
      },
    ]
    : [
      {
        title: (
          <a href="/admin" style={{ color: 'var(--grey-text)' }}>
            {I18n.t('admin.dashboard')}
          </a>
        ),
      },
      {
        title: I18n.t('admin.media_library'),
      },
    ]

  return (
    <>
      <div style={{ borderBottom: '1px solid #eeeeee', padding: 10 }} data-testid="breadcrumbs">
        <AntBreadcrumb items={breadcrumbItems} />
      </div>
      <Resource.Filter placeholder={I18n.t('shared.search')} name="filterable_fields">
        <Button
          disabled={tableLoading}
          onClick={() => openModal('MediaLibraryFormModal', {
            modalTitle:
            I18n.t('admin.add_new_folder'),
          })}
        >
          <PlusOutlined />
          {I18n.t('admin.new_folder')}
        </Button>
        <Button
          type="primary"
          disabled={tableLoading}
          onClick={handleUpload}
        >
          <UploadOutlined />
          {I18n.t('shared.upload')}
        </Button>
      </Resource.Filter>
    </>
  )
}

export default MediaLibraryFilter
