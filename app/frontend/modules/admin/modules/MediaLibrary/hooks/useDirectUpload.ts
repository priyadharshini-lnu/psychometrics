import React from 'react'
import axios from 'axios'
import { message, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload'
import { calculateMD5Checksum } from '~/utils/fileChecksum'

const { I18n } = window
const MAX_DIRECT_UPLOAD_SIZE_MB = 100
const MAX_DIRECT_UPLOAD_SIZE_BYTES = MAX_DIRECT_UPLOAD_SIZE_MB * 1024 * 1024
const s3Axios = axios.create()

type UseDirectUploadOptions = {
  isUpload: boolean
  parentId?: string
  onSuccess: () => void
}

export const useDirectUpload = ({ isUpload, parentId, onSuccess }: UseDirectUploadOptions) => {
  const [fileList, setFileList] = React.useState<UploadFile[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const temporaryUploadIds = React.useRef<Map<string, string>>(new Map())
  const pendingBatchFiles = React.useRef<Array<File & { uid: string }>>([])
  const batchFlushScheduled = React.useRef(false)

  const showMaxFileSizeError = (name: string) => {
    message.error(I18n.t('admin.file_size_must_be_less_than_mb', {
      name,
      max_size_mb: MAX_DIRECT_UPLOAD_SIZE_MB,
    }))
  }

  const isFileSizeValidationError = (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 422) {
      return false
    }

    const errorResponse = error.response.data
    const combinedMessage = [
      errorResponse?.error,
      ...(errorResponse?.errors || []).map(({ title, detail }) => `${title || ''} ${detail || ''}`),
    ].join(' ').toLowerCase()

    return combinedMessage.includes('byte size')
      || combinedMessage.includes('100 megabytes')
      || combinedMessage.includes('less than or equal')
  }

  const updateFileInList = (uid: string, updates: Partial<UploadFile>) => {
    setFileList(prev => prev.map(f => (f.uid === uid ? { ...f, ...updates } : f)))
  }

  const uploadToS3WithProgress = async (
    file: File,
    url: string,
    fields: Record<string, string>,
    onProgress: (percent: number) => void,
  ): Promise<void> => {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
    formData.append('file', file) // file must be appended last for S3 policy

    await s3Axios.post(url, formData, {
      onUploadProgress: (e) => {
        if (e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
  }

  const uploadBatch = async (files: Array<File & { uid: string }>) => {
    const checksums = await Promise.all(files.map(f => calculateMD5Checksum(f)))

    let uploadResponses: Array<{
      presigned_url: string
      presigned_fields: Record<string, string>
      temporary_upload_id: string
    }>

    try {
      const { data } = await axios.post('/api/v2/administration/direct_uploads', {
        files: files.map((f, i) => ({
          filename: f.name,
          content_type: f.type || 'application/octet-stream',
          byte_size: f.size,
          checksum: checksums[i],
        })),
      })
      uploadResponses = data
    } catch (error) {
      const isSizeError = isFileSizeValidationError(error)
      files.forEach((f) => {
        updateFileInList(f.uid, { status: 'error' })
        if (isSizeError) {
          showMaxFileSizeError(f.name)
        } else {
          message.error(I18n.t('admin.file_upload_failed', { name: f.name }))
        }
      })
      return
    }

    await Promise.all(files.map(async (file, i) => {
      const { presigned_url, presigned_fields, temporary_upload_id } = uploadResponses[i]
      try {
        await uploadToS3WithProgress(file, presigned_url, presigned_fields, (percent) => {
          updateFileInList(file.uid, { percent })
        })
        temporaryUploadIds.current.set(file.uid, temporary_upload_id)
        updateFileInList(file.uid, { status: 'done', percent: 100 })
      } catch {
        updateFileInList(file.uid, { status: 'error' })
        message.error(I18n.t('admin.file_upload_failed', { name: file.name }))
      }
    }))
  }

  const flushBatch = () => {
    const files = [...pendingBatchFiles.current]
    pendingBatchFiles.current = []
    batchFlushScheduled.current = false
    uploadBatch(files)
  }

  const handleBeforeUpload = (file: File & { uid: string }) => {
    if (file.size > MAX_DIRECT_UPLOAD_SIZE_BYTES) {
      showMaxFileSizeError(file.name)
      return Upload.LIST_IGNORE
    }

    setFileList(prev => [
      ...prev,
      {
        uid: file.uid,
        name: file.name,
        status: 'uploading' as const,
        percent: 0,
        originFileObj: file as UploadFile['originFileObj'],
      },
    ])

    pendingBatchFiles.current.push(file)

    if (!batchFlushScheduled.current) {
      batchFlushScheduled.current = true
      Promise.resolve().then(flushBatch)
    }

    return false
  }

  const handleRemoveFile = (file: UploadFile) => {
    setFileList(prev => prev.filter(f => f.uid !== file.uid))
    temporaryUploadIds.current.delete(file.uid)
    return true
  }

  const createLibrary = async (data: Record<string, string>) => {
    const hasPendingUploads = fileList.some(f => f.status === 'uploading')
    const uploadedFiles = fileList.filter(f => f.status === 'done')

    if (isUpload && uploadedFiles.length === 0) {
      message.error(I18n.t('admin.upload_required'))
      return
    }

    if (hasPendingUploads) {
      message.warning(I18n.t('admin.wait_for_upload_completion'))
      return
    }

    setIsSubmitting(true)

    try {
      const ownerId = data.ownerId == null ? null : String(data.ownerId)

      if (uploadedFiles.length > 0) {
        const uploadIds = uploadedFiles
          .map(fileObj => temporaryUploadIds.current.get(fileObj.uid))
          .filter(Boolean)

        await axios.post('/api/v2/administration/libraries/create_from_upload', {
          temporary_upload_ids: uploadIds,
          name: data.name,
          description: data.description,
          owner_id: ownerId,
          type: 'other',
          ...(parentId ? { parent_id: parentId } : {}),
        })
      } else {
        await axios.post('/api/v2/administration/libraries', {
          data: {
            type: 'libraries',
            attributes: {
              name: data.name,
              description: data.description,
              owner_id: ownerId,
              type: 'folder',
              ...(parentId ? { parent_id: parentId } : {}),
            },
          },
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Library creation failed', error)
      message.error(I18n.t('admin.dashboard_form_image_upload_failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    fileList,
    isSubmitting,
    handleBeforeUpload,
    handleRemoveFile,
    createLibrary,
  }
}
