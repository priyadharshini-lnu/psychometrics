import PropTypes from 'prop-types'
import { Button, Flex } from 'antd'
import { FileOutlined } from '@ant-design/icons'
import { DeleteOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './FileUpload.less'

const { I18n } = window

const MS_EXTENSIONS = ['.pptx', '.docx', '.doc', '.ppt', '.xls', '.xlsx']
const IMAGE_EXTENSIONS = ['.svg', '.png', '.gif', '.jpg', '.jpeg']
const PDF_EXTENSIONS = ['.pdf']

export default function FileDetails ({
  localFile, savedFile, removeFile, readOnly,
}) {
  let fileDetails = null
  if (savedFile) {
    fileDetails = { filename: savedFile.filename, url: savedFile.url }
  } else if (localFile) {
    fileDetails = { filename: localFile.name }
  } else {
    return null
  }

  return (
    <Flex vertical gap={8}>
      <FilePreview file={savedFile} />
      <div>
        <div className={styles.fileName}>
          {/* eslint-disable no-script-url */}
          <a href={fileDetails.url ? fileDetails.url : 'javascript:void(0)'} target="_blank" rel="noreferrer" download>
            <Flex gap={4}>
              {savedFile?.encodedFileUrl ? <DownloadOutlined className={styles.fileIcon} />
                : <FileOutlined className={styles.fileIcon} />}
              {fileDetails.filename}
            </Flex>
          </a>
        </div>

        {!readOnly && (
          <div className={styles.removeFileButton}>
            <Button
              aria-label={I18n.t('frontend.aria.remove_file')}
              size="small"
              icon={<DeleteOutlined className={styles.deleteIcon} />}
              type="text"
              onClick={removeFile}
            />
          </div>
        )}
      </div>
    </Flex>
  )
}

FileDetails.propTypes = {
  localFile: PropTypes.object,
  savedFile: PropTypes.object,
  removeFile: PropTypes.func.isRequired,
}


const FilePreview = ({ file }) => {
  if (!file) return null
  const {
    fileExtension, encodedFileUrl, url,
  } = file
  if (!url || (!encodedFileUrl && MS_EXTENSIONS.includes(fileExtension))) return null
  if (MS_EXTENSIONS.includes(fileExtension)) {
    return (
      <iframe
        title={file.filename}
        className={styles.filePreview}
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedFileUrl}`}
      />
    )
  } if (IMAGE_EXTENSIONS.includes(fileExtension)) {
    return <img src={url} className={styles.imagePreview} />
  } if (PDF_EXTENSIONS.includes(fileExtension)) {
    return (
      <object
        data={`${url}#toolbar=0&navpanes=0`}
        type="application/pdf"
        className={styles.filePreview}
      />
    )
  }
  return null
}
