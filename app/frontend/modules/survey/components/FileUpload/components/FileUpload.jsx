import _ from 'lodash'
import {
  useEffect, useReducer, useLayoutEffect, useRef,
} from 'react'
import PropTypes from 'prop-types'
import {
  Upload, Button, Progress,
} from 'antd'
import { UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import api from '~/middleware/api'
import ErrorList from './ErrorList'
import FileDetails from './FileDetails'
import FileValidation from './FileValidation'
import FileUploader from './FileUploader'
import reducer, {
  SET_UPLOAD_STATE, SET_FILE, REMOVE_FILE, SET_ERRORS, initialState, deleteFile,
} from './reducer'
import { UPLOAD_STATES } from './constants'

const { I18n } = window

export default function FileUpload ({
  mediaUrl,
  model,
  fakeUpload,
  onSuccessUpload,
  onRemoveFile,
  readOnly,
  markQuestionInProgress,
  removeQuestionInProgress,
  mediaResponse,
  onBeforeRemove,
}) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const uploadRef = useRef(null)
  const uploadSuccessRef = useRef(null)
  const setTimeoutClearMessageIdRef = useRef(null)

  useEffect(() => {
    if (mediaResponse && mediaResponse.url) {
      dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    }
  }, [])

  // TODO: Remove this after upgrading antd to version >= 5.12.6
  useLayoutEffect(() => {
    if (uploadRef.current?.parentNode) {
      uploadRef.current.parentNode.tabIndex = -1
      uploadRef.current.parentNode.role = 'none'
    }

    return () => {
      if (setTimeoutClearMessageIdRef.current) {
        clearTimeout(setTimeoutClearMessageIdRef.current)
      }
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

  const allowedFileTypes = () => {
    const { props: { allowedFileTypes } } = model
    return _.includes(allowedFileTypes, 'jpg') ? [...allowedFileTypes, 'jpeg'] : allowedFileTypes
  }

  const validateFile = (file) => {
    const { props: { maxFileSize } } = model
    const errorCodes = FileValidation.run(file, allowedFileTypes(), maxFileSize)

    const valid = _.isEmpty(errorCodes)

    if (!valid) {
      dispatch({ type: SET_ERRORS, payload: { errorCodes } })
    }

    return valid
  }

  const handleSuccessfulUpload = (media) => {
    removeQuestionInProgress(model.id)
    if (uploadSuccessRef.current) {
      uploadSuccessRef.current.innerText = I18n.t('frontend.aria.file_uploaded')
      setTimeoutClearMessageIdRef.current = setTimeout(() => {
        if (uploadSuccessRef.current) {
          uploadSuccessRef.current.innerText = ''
        }
      }, 10000)
    }
    onSuccessUpload && onSuccessUpload(media)
  }

  const handleFail = () => {
    dispatch({ type: SET_FILE, payload: { file: null } })
    removeQuestionInProgress(model.id)
  }

  const uploadFile = (id, file) => {
    const urls = {
      mediaUploadUrl: `${mediaUrl}/upload_media_url?question_id=${id}&file_name=${file.name}`,
      callbackUrl: `${mediaUrl}/upload_callback`,
    }
    markQuestionInProgress(id, UPLOAD_STATES.SAVING)
    FileUploader.run({
      urls, file, dispatch, onSuccessUpload: handleSuccessfulUpload, onFail: handleFail,
    })
  }

  const handleFileChange = ({ file }) => {
    dispatch({ type: SET_FILE, payload: { file: file.originFileObj } })
    saveFile(file.originFileObj)
  }

  const removeFile = () => {
    onBeforeRemove && onBeforeRemove()
    dispatch({ type: REMOVE_FILE })
    if (mediaResponse) {
      const { id } = mediaResponse
      api()(dispatch)(deleteFile(`${mediaUrl}/remove_media`, id)).then(() => {
        onRemoveFile && onRemoveFile()
      })
    }
  }

  const {
    uploadState, file, percent, errorCodes, errorMessages,
  } = state
  const showProgress = uploadState === UPLOAD_STATES.SAVING
  const showError = uploadState === UPLOAD_STATES.ERROR
  const fileExtension = _.map(allowedFileTypes(), extension => `.${extension}`)

  return (
    <div>
      {showError && <ErrorList errorCodes={errorCodes} errorMessages={errorMessages} errorProps={model.props} />}
      {uploadState !== UPLOAD_STATES.SAVED && (
        <>
          <Upload
            accept={_.join(fileExtension, ',')}
            customRequest={() => {}}
            fileList={[]}
            onChange={handleFileChange}
            disabled={readOnly}
          >
            <Button
              ref={uploadRef}
            >
              <UploadOutlined />
              {' '}
              {I18n.t('shared.file_upload_button')}
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
        && <FileDetails localFile={file} savedFile={mediaResponse} removeFile={removeFile} readOnly={readOnly} /> }
      <div className="sr-only" aria-live="polite" ref={uploadSuccessRef} />
    </div>
  )
}

FileUpload.propTypes = {
  mediaUrl: PropTypes.string,
  model: PropTypes.object.isRequired,
  onSuccessUpload: PropTypes.func,
  onRemoveFile: PropTypes.func,
  onBeforeRemove: PropTypes.func,
  fakeUpload: PropTypes.bool.isRequired,
}
