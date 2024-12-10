import PropTypes from 'prop-types'
import { Button } from 'antd'
import { FileOutlined } from '@ant-design/icons'
import { DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './FileUpload.less'

const { I18n } = window

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
    <div>
      <div className={styles.fileName}>
        {/* eslint-disable no-script-url */}
        <a href={fileDetails.url ? fileDetails.url : 'javascript:void(0)'} target="_blank" rel="noreferrer" download>
          <FileOutlined className={styles.fileIcon} />
          {fileDetails.filename}
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
  )
}

FileDetails.propTypes = {
  localFile: PropTypes.object,
  savedFile: PropTypes.object,
  removeFile: PropTypes.func.isRequired,
}
