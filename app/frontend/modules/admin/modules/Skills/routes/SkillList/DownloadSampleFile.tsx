import React, { useRef, useState } from 'react'
import { Button, message } from 'antd'
import { CloudDownloadOutlined } from '@ant-design/icons'

interface Props {
  filename?: string
  fileData: string
  buttonText?: string
  fileType?: 'csv'
}

const { I18n } = window

const DownloadSampleFile: React.FC<Props> = ({
  filename = 'example',
  fileData,
  buttonText = I18n.t('administration.download_sample_file.download_example_file'),
  fileType = 'csv',
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)

  const getMimeType = () => {
    switch (fileType) {
      case 'csv':
      default:
        return 'text/csv;charset=utf-8;'
    }
  }

  const downloadFile = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const blob = new Blob([fileData], {
        type: getMimeType(),
      })
      const url = window.URL.createObjectURL(blob)

      if (linkRef.current) {
        linkRef.current.href = url
        linkRef.current.download = filename
        linkRef.current.click()
        window.URL.revokeObjectURL(url)
        message.success(I18n.t('administration.download_sample_file.download_started_successfully'))
      }
    } catch (err) {
      message.error(I18n.t('administration.download_sample_file.failed_to_download'))
      console.error('Error downloading file:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        type="link"
        onClick={downloadFile}
        loading={isLoading}
        icon={<CloudDownloadOutlined />}
      >
        {buttonText}
      </Button>
      <a
        ref={linkRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </>
  )
}

export default DownloadSampleFile
