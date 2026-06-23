import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import {
  MenuProps,
  App,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { openModal } from '~/modules/admin/core/ui/modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import { MediaLibraryFilter } from './MediaLibraryFilter'
import {
  ExclamationCircleOutlined, FileImageOutlined, FolderOutlined, FileOutlined, VideoCameraOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { MediaLibraryFormModal } from './MediaLibraryFormModal'
import Modals from '~/modules/admin/components/Modals'
import useCopyToClipboard from '~/hooks/useCopyToClipboard'
import { MediaLibrary } from '../../client/core/libraries'

const { I18n } = window

const MODALS = {
  MediaLibraryFormModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const MediaLibraryTable: React.FC<Props> = ({ openModal }) => {
  const { resource } = useResourceContext()
  const {
    removeResource,
  } = resource

  const [, copyValue] = useCopyToClipboard()

  const getIconByType = (item) => {
    if (item?.type === 'image') {
      if (item?.fileUrl) {
        return <img src={item.fileUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      }
      return <FileImageOutlined style={{ fontSize: '3rem' }} />
    }
    if (item?.type === 'video') {
      if (item?.fileUrl) {
        return (
          <video
            src={item.fileUrl}
            style={{ maxWidth: '100%', maxHeight: '100%', background: '#000' }}
            preload="metadata"
          />
        )
      }
      return <VideoCameraOutlined style={{ fontSize: '3rem' }} />
    }
    if (item?.type === 'folder') {
      return <FolderOutlined style={{ fontSize: '3rem' }} />
    }
    return <FileOutlined style={{ fontSize: '3rem' }} />
  }
  return (
    <>
      <MediaLibraryFilter
        openModal={openModal}
      />
      <Resource.Table pagination>
        <Resource.Column
          title="Type"
          id="type"
          sorter
          render={item => getIconByType(item)}
          width={80}
          align="center"
        />
        <Resource.Column
          title={`${I18n.t('shared.name')}`}
          id="name"
          sorter
          width={300}
          render={item => (
            item?.type === 'folder' ? (
              <a onClick={() => {
                resource.changeUrlQuery({ filter: { with_parent: item.id } })
              }}
              >
                {item?.name}
              </a>
            ) : item?.name
          )}
        />
        <Resource.Column
          title="Description"
          width={300}
          id="description"
          render={item => item?.description}
        />
        <Resource.Column
          title={`${I18n.t('shared.owner')}`}
          id="owner.name"
          width={200}
          render={(_, { owner }) => (
            owner?.id ? (
              <Link to={`/admin/clients/${owner.id}/projects`}>{owner.name}</Link>
            ) : <span>{I18n.t('admin.tte')}</span>
          )}
        />
        <Resource.Column
          title={`${I18n.t('common.column.created_at')}`}
          id="createdAt"
          dataIndex="createdAt"
          sorter
          width={150}
          render={createdAt => createdAt}
        />
        <Resource.Column
          title={I18n.t('common.column.action')}
          id="action"
          render={item => (
            <ConditionalDropdown
              menu={
                    getActionMenuProps({
                      library: item,
                      removeResource,
                      openModal,
                      copyValue,
                    })
                }
            />
          )}
          width={100}
        />
      </Resource.Table>
      <Modals modals={MODALS} />
    </>
  )
}
interface ActionMenuData {
    library: MediaLibrary
    removeResource: (id: string) => void
    openModal: (modalName: string, modalProps: unknown) => void
    copyValue: (value: string) => Promise<boolean>
}

const getActionMenuProps = ({
  library, removeResource, openModal, copyValue,
}: ActionMenuData): MenuProps => {
  const {
    id,
  } = library

  const { modal, message } = App.useApp()

  const handleDelete = () => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('admin.remove_confirmation'),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        removeResource(id)
        message.success(I18n.t('admin.remove_successfully'))
      },
    })
  }

  const copyURL = () => {
    copyValue(library.fileUrl as string).then(() => {
      message.success({
        content: I18n.t('admin.copied_url_success'),
        style: {
          position: 'relative',
          top: '24px',
        },
      })
    })
  }

  const menuItems = [
    { key: 'edit', label: I18n.t('shared.edit') },
    { key: 'remove', label: I18n.t('shared.remove') },
  ]

  if (library.type !== 'folder') {
    menuItems.push({ key: 'copy', label: I18n.t('admin.copy_url') })
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('MediaLibraryFormModal', {
        library,
        modalTitle: library.type === 'folder'
          ? I18n.t('admin.edit_folder')
          : I18n.t('admin.edit_media'),
      })
    }
    if (key === 'remove') {
      handleDelete()
    }

    if (key === 'copy') {
      copyURL()
    }
  }

  return ({ items: _.compact(menuItems), onClick: handleMenuClick })
}

export default connecter(MediaLibraryTable)
