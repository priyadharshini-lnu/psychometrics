import React from 'react'
import {
  Form, Input, Select, Spin, Upload, Button,
} from 'antd'
import { debounce } from 'lodash'
import { isSuperAdmin } from '~/core/currentUser'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MediaLibrary } from '~/modules/admin/modules/client/core/libraries'
import { useDirectUpload } from '../hooks/useDirectUpload'

const { I18n } = window

interface Props {
  library?: MediaLibrary;
  close(): void
  isUpload: boolean;
  modalTitle: string
}

export const MediaLibraryFormModal: React.FC<Props> = ({
  library,
  close,
  isUpload = false,
  modalTitle,
}) => {
  const isCreatingFolder = !library && !isUpload

  const { currentUser } = useCurrentUser()
  const currentUserRoleTitle = currentUser?.roleTitle || currentUser?.role_title
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const currentUserClientIds = currentUser?.clientAdminClientIds || currentUser?.client_admin_client_ids || []
  const isClientAdmin = currentUserRoleTitle === 'Client Admin'
  const showOwnerField = isSuperAdmin(currentUser)
    || (isClientAdmin && ((currentUser?.libraryOwnerFieldVisible ?? currentUserClientIds.length > 1)
      || clients.length > 1))

  const { resource } = useResourceContext<MediaLibrary>()

  const parentId = resource.getFilteredValue('with_parent') as string | undefined

  const {
    fileList, isSubmitting, handleBeforeUpload, handleRemoveFile, createLibrary,
  } = useDirectUpload({
    isUpload,
    parentId,
    onSuccess: () => {
      resource.fetch()
      close()
    },
  })

  const fetchOwnersByValue = (value: string) => fetchClients({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 50)

  type OptionsType = {
    id: string
    name: string
  }
  const getClients = (): OptionsType[] => {
    if (!library || !library.owner || clients.find(d => library?.owner?.id === d.id)) {
      return clients
    }
    return [...clients, library.owner]
  }

  const updateLibrary = async (data) => {
    const libraryFormData = new FormData()
    libraryFormData.append('data[type]', 'libraries')
    libraryFormData.append('data[attributes][name]', data.name)
    libraryFormData.append('data[attributes][description]', data.description)

    const selectedFile = fileList[0]?.originFileObj
    if (selectedFile instanceof File) {
      libraryFormData.append('file', selectedFile)
    }

    if (data.ownerId) {
      libraryFormData.append('data[attributes][owner_id]', String(data.ownerId))
    }

    if (resource.getFilteredValue('with_parent')) {
      libraryFormData.append('data[attributes][parent_id]', resource.getFilteredValue('with_parent') as string)
    }

    libraryFormData.append('data[id]', (library as MediaLibrary).id)

    try {
      await resource.uploadFileAction(`libraries/${(library as MediaLibrary).id}`, libraryFormData, 'put')
      resource.fetch()
    } catch (error) {
      console.error('Upload failed', error)
    }
  }

  const getOptionsForClients = () => {
    const clientsOptions: { label: string, value: number | string | null }[] = getClients().map(({ id, name }) => ({
      label: name,
      value: +id,
    }))

    if (isSuperAdmin(currentUser)) {
      clientsOptions.unshift({ label: I18n.t('admin.platform_owner'), value: null })
    }
    return clientsOptions
  }

  return (
    <ResourceFormModal
      resourceName="libraries"
      resource={library}
      title={modalTitle}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: undefined, // Handled internally now to support spinner
        updateResource: updateLibrary,
      }}
      formProps={{
        ...(library ? {} : { onFinish: createLibrary }),
        initialValues: {
          ...library,
          description: library?.description || '',
          ...(showOwnerField ? { ownerId: library?.owner?.id || ' ' } : {}),
        },
      }}
    >
      {() => (
        <Spin spinning={isSubmitting}>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            required={isCreatingFolder}
            rules={[
              {
                validator: (_, value) => {
                  if (!isCreatingFolder) {
                    return Promise.resolve()
                  }

                  const trimmedValue = String(value ?? '').trim()
                  return trimmedValue
                    ? Promise.resolve()
                    : Promise.reject(new Error(I18n.t('admin.this_field_is_required')))
                },
              },
            ]}
          >
            <Input name="name" />
          </Form.Item>

          {showOwnerField && (
            <Form.Item
              name="ownerId"
              label={I18n.t('shared.owner')}
              initialValue={library?.owner?.id || ' '}
              rules={[
                {
                  validator: (_, value) => {
                    if (value !== undefined) return Promise.resolve()

                    return Promise.reject(new Error(I18n.t('admin.this_field_is_required')))
                  },
                },
              ]}
            >
              <Select
                showSearch
                onSearch={searchAvailableOwners}
                notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
                filterOption={false}
                options={getOptionsForClients()}
              />
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input.TextArea name="description" />
          </Form.Item>

          {(isUpload || (!!library && library?.type !== 'folder'))
            && (
              <Form.Item
                name="file"
                label={I18n.t('admin.media_files_label')}
                rules={[
                  {
                    validator: () => {
                      // Only require file when creating new item
                      if (isUpload && fileList.length === 0) {
                        return Promise.reject(new Error(I18n.t('admin.upload_required')))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Upload
                  listType="picture"
                  maxCount={library ? 1 : undefined}
                  multiple={!library}
                  // eslint-disable-next-line max-len
                  accept=".jpg, .png, .jpeg, |image/*, .svg, .pdf, .mp3, .mp4, .wma, .avi, .gif, .csv, .xlsx, .xls, .pptx, .ppt, .docx, .doc, .zip"
                  fileList={fileList}
                  beforeUpload={handleBeforeUpload}
                  onRemove={handleRemoveFile}
                >
                  <Button icon={<UploadOutlined />}>
                    {I18n.t('shared.upload')}
                  </Button>
                </Upload>
              </Form.Item>
            )}
        </Spin>
      )}
    </ResourceFormModal>
  )
}
