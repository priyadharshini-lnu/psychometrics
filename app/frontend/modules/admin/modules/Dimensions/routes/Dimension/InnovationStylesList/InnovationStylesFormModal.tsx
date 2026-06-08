import React, { useState } from 'react'
import {
  Avatar,
  Button,
  Form,
  Input,
  Upload,
  Space,
} from 'antd'
import { useDispatch } from 'react-redux'
import { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'
import { useParams } from 'react-router-dom'
import { UploadOutlined, DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { InnovationStyles, uploadFiles } from '~/modules/admin/modules/campaigns/core/innovationStyles'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'

type Props = {
  close(): void
  innovation?: InnovationStyles
}

const { I18n } = window
const { TextArea } = Input

export const InnovationStylesFormModal: React.FC<Props> = ({ close, innovation }) => {
  const dispatch = useDispatch()
  const { resource } = useResourceContext<InnovationStyles>()
  const [form] = Form.useForm()
  const { dimensionId } = useParams()

  const [iconFile, setIconFile] = useState<File | null>(null)
  const [removeIcon, setRemoveIcon] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleUploadChange = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList)
    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
      setIconFile(info.fileList[0].originFileObj as File)
    } else {
      setIconFile(null)
    }
  }

  const createInnovationStyles = (data: InnovationStyles) => resource.createResource(data).then((innovationStyle) => {
    if (iconFile) {
      const fd = new FormData()
      fd.append('icon', iconFile)
      dispatch(uploadFiles(dimensionId as string, innovationStyle.id, fd))
    }
  })

  const updateInnovationStyles = (data: InnovationStyles) => {
    if (iconFile) {
      const fd = new FormData()
      fd.append('icon', iconFile)
      dispatch(uploadFiles(dimensionId as string, innovation?.id as string, fd))
    } else if (removeIcon) {
      const fd = new FormData()
      fd.append('purge_icon', 'true')
      dispatch(uploadFiles(dimensionId as string, innovation?.id as string, fd))
    }

    return resource.updateResource(data)
  }

  return (
    <ResourceFormModal
      resourceName="innovation"
      resource={innovation}
      readableResourceName={I18n.t('admin.innovation_styles_index_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createInnovationStyles, updateResource: updateInnovationStyles }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[
              { required: true, message: I18n.t('admin.name_required') },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="fullDescription"
            label={I18n.t('admin.innovation_styles_form_full_description')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="position"
            label={I18n.t('admin.innovation_styles_list_position')}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label={I18n.t('shared.icon')}
          >
            <Space orientation="vertical">
              {innovation?.iconUrl && !removeIcon && (
                <Space>
                  <Avatar src={innovation.iconUrl} size={64} shape="square" />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setRemoveIcon(true)}
                  >
                    {I18n.t('shared.delete')}
                  </Button>
                </Space>
              )}
              <Upload
                listType="picture"
                maxCount={1}
                accept=".jpg, .png, .jpeg, |image/*"
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleUploadChange}
              >
                <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
              </Upload>
            </Space>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
