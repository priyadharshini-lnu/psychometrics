import _ from 'lodash'
import React, { useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import {
  Upload, Button, Progress,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import mime from 'mime-types'
import api from 'middleware/api'
import ErrorList from './ErrorList'
import FileDetails from './FileDetails'
import FileValidation from './FileValidation'
import FileUploader from './FileUploader'
import reducer, {
  SET_UPLOAD_STATE, SET_FILE, REMOVE_FILE, SET_ERRORS, initialState, deleteFile,
} from './reducer'
import { UPLOAD_STATES } from './constants'

export default function FileUpload ({
  mediaUrl,
  model,
  model: { result },
  fakeUpload,
  onSuccessUpload,
  onRemoveFile,
  readOnly,
  markQuestionInProgress,
  removeQuestionInProgress,
}) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (result && result.answers.length > 0) {
      dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    }
  }, [])

  const saveFile = async (file) => {
    dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVING } })
    if (!validateFile(file)) { return }
    if (fakeUpload) {
      return dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    }
    uploadFile(model.id, file)
  }

  const allowedMimeTypes = () => {
    const { props: { allowedFileTypes } } = model
    return allowedFileTypes.map(fileType => mime.lookup(fileType))
  }

  const validateFile = (file) => {
    const { props: { maxFileSize } } = model
    const errorCodes = FileValidation.run(file, allowedMimeTypes(), maxFileSize)

    const valid = _.isEmpty(errorCodes)

    if (!valid) {
      dispatch({ type: SET_ERRORS, payload: { errorCodes } })
    }

    return valid
  }

  const handleSuccessfulUpload = (media) => {
    removeQuestionInProgress(model.id)
    onSuccessUpload && onSuccessUpload(media)
  }

  const uploadFile = (id, file) => {
    const urls = {
      mediaUploadUrl: `${mediaUrl}/upload_media_url?question_id=${id}`,
      callbackUrl: `${mediaUrl}/upload_callback`,
    }
    markQuestionInProgress(id, UPLOAD_STATES.SAVING)
    FileUploader.run({
      urls, file, dispatch, onSuccessUpload: handleSuccessfulUpload,
    })
  }

  const handleFileChange = ({ file }) => {
    dispatch({ type: SET_FILE, payload: { file: file.originFileObj } })
    saveFile(file.originFileObj)
  }

  const removeFile = () => {
    dispatch({ type: REMOVE_FILE })
    if (result && result.answers.length > 0) {
      const mediaId = result.answers[0].media_id
      if (mediaId) {
        api()(dispatch)(deleteFile(`${mediaUrl}/remove_media`, mediaId)).then(() => {
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
    <div>
      {showError && <ErrorList errorCodes={errorCodes} errorMessage={errorMessage} errorProps={model.props} />}
      {uploadState !== UPLOAD_STATES.SAVED && (
      <>
        <Upload
          accept={_.join(allowedMimeTypes(), ',')}
          customRequest={() => {}}
          fileList={[]}
          onChange={handleFileChange}
          disabled={readOnly}
        >
          <Button>
            <UploadOutlined />
            {' '}
            Select File
          </Button>
          {'   '}
          <span>{file && file.name}</span>
        </Upload>
        {showProgress && (
          <Progress
            type="circle"
            percent={percent}
            width={32}
            className="mtm"
          />
        )}
      </>
      )}
      {uploadState === UPLOAD_STATES.SAVED
        && <FileDetails localFile={file} savedFile={answer} removeFile={removeFile} readOnly={readOnly} /> }
    </div>
  )
}

FileUpload.propTypes = {
  mediaUrl: PropTypes.string,
  model: PropTypes.object.isRequired,
  onSuccessUpload: PropTypes.func,
  onRemoveFile: PropTypes.func,
  fakeUpload: PropTypes.bool.isRequired,
}
