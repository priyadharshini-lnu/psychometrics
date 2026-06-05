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
import { Occupation, uploadFiles } from '~/modules/admin/modules/campaigns/core/occupations'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'

type Props = {
  close(): void
  occupation?: Occupation
}

type FileState = {
  file: File | null
  fileList: UploadFile[]
  removed: boolean
}

type FileStates = {
  icon: FileState
  alternativeIcon: FileState
  indicativeRolesImage: FileState
  keyCareerTracksImage: FileState
}

const { I18n } = window
const { TextArea } = Input

const initialFileState: FileState = {
  file: null,
  fileList: [],
  removed: false,
}

export const OccupationsFormModal: React.FC<Props> = ({ close, occupation }) => {
  const dispatch = useDispatch()
  const { resource } = useResourceContext<Occupation>()
  const [form] = Form.useForm()
  const { dimensionId } = useParams()

  const [fileStates, setFileStates] = useState<FileStates>({
    icon: { ...initialFileState },
    alternativeIcon: { ...initialFileState },
    indicativeRolesImage: { ...initialFileState },
    keyCareerTracksImage: { ...initialFileState },
  })

  const handleUploadChange = (fieldName: keyof FileStates) => (info: UploadChangeParam<UploadFile>) => {
    const file = info.fileList.length > 0 && info.fileList[0].originFileObj
      ? (info.fileList[0].originFileObj as File)
      : null

    setFileStates(prev => ({
      ...prev,
      [fieldName]: {
        file,
        fileList: info.fileList,
        removed: false,
      },
    }))
  }

  const handleRemoveIcon = (fieldName: keyof FileStates) => {
    setFileStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        removed: true,
      },
    }))
  }

  const uploadAllFiles = (occupationId?: string): void => {
    if (!occupationId) return

    const fd = new FormData()

    // Map of field names to their FormData field names
    const fieldMapping: Record<keyof FileStates, string> = {
      icon: 'icon',
      alternativeIcon: 'alternative_icon',
      indicativeRolesImage: 'indicative_roles_image',
      keyCareerTracksImage: 'key_career_tracks_image',
    }

    let hasFiles = false

    Object.entries(fileStates).forEach(([fieldName, fileState]) => {
      const formDataField = fieldMapping[fieldName as keyof FileStates]

      if (fileState.file) {
        fd.append(formDataField, fileState.file)
        hasFiles = true
      }

      if (fileState.removed) {
        fd.append(`purge_${formDataField}`, 'true')
        hasFiles = true
      }
    })

    if (hasFiles) {
      dispatch(uploadFiles(dimensionId as string, occupationId, fd))
    }
  }

  const createOccupation = (data: Occupation) => resource.createResource(data)
    .then((createdOccupation) => {
      uploadAllFiles(createdOccupation.id)
    })

  const updateOccupation = (data: Occupation) => resource.updateResource(data)
    .then(() => {
      uploadAllFiles(occupation?.id)
    })

  return (
    <ResourceFormModal
      resourceName="occupation"
      resource={occupation}
      readableResourceName={I18n.t('administration.occupations.index.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createOccupation, updateResource: updateOccupation }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('common.column.name')}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('common.column.description')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="fullDescription"
            label={I18n.t('administration.innovation_styles.form.full_description')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="potentialAreasOfStudy"
            label={I18n.t('activerecord.attributes.occupation.potential_areas_of_study')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="keyCareerTracks"
            label={I18n.t('activerecord.attributes.occupation.key_career_tracks')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="highSchoolEntryRoles"
            label={I18n.t('activerecord.attributes.occupation.high_school_entry_roles')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="diplomaQualification"
            label={I18n.t('activerecord.attributes.occupation.diploma_qualification')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="bachelorsOrMastersQualification"
            label={I18n.t('activerecord.attributes.occupation.bachelors_or_masters_qualification')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="workEnvironment"
            label={I18n.t('activerecord.attributes.occupation.work_environment')}
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            name="color"
            label={I18n.t('administration.occupations.form.color')}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.factors.index.icon')}
          >
            <Space orientation="vertical">
              {occupation?.iconUrl && !fileStates.icon.removed && (
                <Space>
                  <Avatar src={occupation.iconUrl} size={64} shape="square" />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveIcon('icon')}
                  >
                    {I18n.t('common.actions.delete')}
                  </Button>
                </Space>
              )}
              <Upload
                listType="picture"
                maxCount={1}
                accept=".jpg, .png, .jpeg, |image/*"
                beforeUpload={() => false}
                fileList={fileStates.icon.fileList}
                onChange={handleUploadChange('icon')}
              >
                <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
              </Upload>
            </Space>
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.occupations.form.alternative_icon')}
          >
            <Space orientation="vertical">
              {occupation?.alternativeIconUrl && !fileStates.alternativeIcon.removed && (
                <Space>
                  <Avatar
                    src={occupation.alternativeIconUrl}
                    size={64}
                    shape="square"
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveIcon('alternativeIcon')}
                  >
                    {I18n.t('common.actions.delete')}
                  </Button>
                </Space>
              )}
              <Upload
                listType="picture"
                maxCount={1}
                accept=".jpg, .png, .jpeg, |image/*"
                beforeUpload={() => false}
                fileList={fileStates.alternativeIcon.fileList}
                onChange={handleUploadChange('alternativeIcon')}
              >
                <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
              </Upload>
            </Space>
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.occupations.form.indicative_roles_image')}
          >
            <Space orientation="vertical">
              {occupation?.indicativeRolesImageUrl && !fileStates.indicativeRolesImage.removed && (
                <Space>
                  <Avatar
                    src={occupation.indicativeRolesImageUrl}
                    size={64}
                    shape="square"
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveIcon('indicativeRolesImage')}
                  >
                    {I18n.t('common.actions.delete')}
                  </Button>
                </Space>
              )}
              <Upload
                listType="picture"
                maxCount={1}
                accept=".jpg, .png, .jpeg, |image/*"
                beforeUpload={() => false}
                fileList={fileStates.indicativeRolesImage.fileList}
                onChange={handleUploadChange('indicativeRolesImage')}
              >
                <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
              </Upload>
            </Space>
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.occupations.form.key_career_tracks_image')}
          >
            <Space orientation="vertical">
              {occupation?.keyCareerTracksImageUrl && !fileStates.keyCareerTracksImage.removed && (
                <Space>
                  <Avatar
                    src={occupation.keyCareerTracksImageUrl}
                    size={64}
                    shape="square"
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveIcon('keyCareerTracksImage')}
                  >
                    {I18n.t('common.actions.delete')}
                  </Button>
                </Space>
              )}
              <Upload
                listType="picture"
                maxCount={1}
                accept=".jpg, .png, .jpeg, |image/*"
                beforeUpload={() => false}
                fileList={fileStates.keyCareerTracksImage.fileList}
                onChange={handleUploadChange('keyCareerTracksImage')}
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
