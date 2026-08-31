import {
  Breadcrumb as AntBreadcrumb, Button, Flex, theme,
} from 'antd'
import { Link } from 'react-router-dom'
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
  const { token } = theme.useToken()

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

  // Only the folder navigator: at the root this would repeat the page title the sider nav already gives.
  const breadcrumbItems = [
    {
      title: <Link to="/admin">{I18n.t('admin.dashboard')}</Link>,
    },
    {
      title: <a onClick={() => navigateToFolder(null)}>{I18n.t('admin.media_library')}</a>,
    },
    ...ancestors.slice(0, -1).map(ancestor => ({
      title: <a onClick={() => navigateToFolder(ancestor.id)}>{ancestor.name}</a>,
    })),
    {
      title: ancestors[ancestors.length - 1]?.name,
    },
  ]

  return (
    <>
      {isInsideFolder && (
        <Flex style={{ paddingInline: token.padding, paddingTop: token.padding }} data-testid="breadcrumbs">
          <AntBreadcrumb items={breadcrumbItems} />
        </Flex>
      )}
      <Resource.Filter
        placeholder={I18n.t('shared.search')}
        name="filterable_fields"
      >
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
