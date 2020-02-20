import _ from 'lodash'
import React, { useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import AssessmentPreviewStore from 'store/AssessmentPreviewStore'
import {
  Upload, Button, Icon, Progress,
} from 'antd'
import mime from 'mime-types'
import styles from './FileUpload.scss'
import ErrorList from './ErrorList'
import FileDetails from './FileDetails'
import FileValidation from './FileValidation'
import FileUploader from './FileUploader'
import reducer, {
  SET_UPLOAD_STATE, SET_FILE, REMOVE_FILE, SET_ERRORS, initialState,
} from './reducer'
import { UPLOAD_STATES } from './constants'

const { $ } = window

export default function FileUpload ({
  model,
  model: { result },
  fakeUpload,
  onSuccessUpload,
  onRemoveFile,
}) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (result && result.answers.length > 0) {
      dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    }
  }, [])

  const saveFile = async () => {
    dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVING } })
    if (!validateFile()) { return }
    if (fakeUpload) {
      return dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    }
    uploadFile(model.id)
  }

  const allowedMimeTypes = () => {
    const { props: { allowedFileTypes } } = model
    return allowedFileTypes.map(fileType => mime.lookup(fileType))
  }

  const validateFile = () => {
    const { file } = state
    const { props: { maxFileSize } } = model
    const errorCodes = FileValidation.run(file, allowedMimeTypes(), maxFileSize)

    const valid = _.isEmpty(errorCodes)

    if (!valid) {
      dispatch({ type: SET_ERRORS, payload: { errorCodes } })
    }

    return valid
  }

  const uploadFile = (id) => {
    const { file } = state
    const urls = {
      mediaUploadUrl: `${AssessmentPreviewStore.mediaUrl}/upload_media_url?question_id=${id}`,
      callbackUrl: `${AssessmentPreviewStore.mediaUrl}/upload_callback`,
    }
    FileUploader.run({
      urls, file, dispatch, onSuccessUpload,
    })
  }

  const handleFileChange = ({ file }) => {
    dispatch({ type: SET_FILE, payload: { file: file.originFileObj } })
  }

  const removeFile = () => {
    dispatch({ type: REMOVE_FILE })
    if (result && result.answers.length > 0) {
      const mediaId = result.answers[0].media_id
      if (mediaId) {
        $.ajax({
          method: 'DELETE',
          url: `${AssessmentPreviewStore.mediaUrl}/remove_media`,
          data: { media_id: mediaId },
        }).done(() => {
          onRemoveFile && onRemoveFile()
        })
      }
    }
  }

  const {
    uploadState, file, percent, errorCodes, errorMessage,
  } = state
  const answer = result.answers[0]
  const showProgress = uploadState === UPLOAD_STATES.SAVING
  const showError = uploadState === UPLOAD_STATES.ERROR

  return (
    <div className="col-md-8">
      {showError && <ErrorList errorCodes={errorCodes} errorMessage={errorMessage} errorProps={model.props} />}
      {uploadState !== UPLOAD_STATES.SAVED && (
      <>
        <Upload
          accept={_.join(allowedMimeTypes(), ',')}
          customRequest={() => {}}
          fileList={[]}
          onChange={handleFileChange}
        >
          <Button>
            <Icon type="upload" />
            {' '}
            Select File
          </Button>
          {'   '}
          <span>{file && file.name}</span>
        </Upload>
        <Button
          type="primary"
          onClick={saveFile}
          disabled={!file}
          className={styles.saveFileBtn}
        >
          {showProgress ? ' Uploading ' : ' Start Upload '}
        </Button>
        {showProgress && (
          <Progress
            type="circle"
            percent={percent}
            width={32}
            className={styles.progressBar}
          />
        )}
      </>
      )}
      {uploadState === UPLOAD_STATES.SAVED
        && <FileDetails localFile={file} savedFile={answer} removeFile={removeFile} /> }
    </div>
  )
}

FileUpload.propTypes = {
  model: PropTypes.object.isRequired,
  onSuccessUpload: PropTypes.func,
  onRemoveFile: PropTypes.func,
  fakeUpload: PropTypes.bool.isRequired,
}
