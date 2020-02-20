import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import styles from './FileUpload.scss'

export default function FileDetails ({ localFile, savedFile, removeFile }) {
  let fileDetails = null
  if (savedFile) {
    fileDetails = { filename: savedFile.filename, url: savedFile.value }
  } else if (localFile) {
    fileDetails = { filename: localFile.name }
  } else {
    return null
  }

  return (
    <div>
      <div className={styles.fileName}>
        {/* eslint-disable no-script-url */}
        <a href={fileDetails.url ? fileDetails.url : 'javascript:void(0)'} download>
          <Icon
            type="file"
            className={styles.fileIcon}
          />
          {fileDetails.filename}
        </a>
      </div>
      <div className={styles.removeFileButton}>
        <a onClick={removeFile}>
          <Icon
            type="delete"
            className={styles.deleteIcon}
          />
        </a>
      </div>
    </div>
  )
}

FileDetails.propTypes = {
  localFile: PropTypes.object,
  savedFile: PropTypes.object,
  removeFile: PropTypes.func.isRequired,
}
