import humps from 'humps'
import { DirectUpload } from '@rails/activestorage'
import { SET_UPLOAD_STATE, SET_ERRORS, SET_PERCENTAGE } from './reducer'
import { UPLOAD_STATES } from './constants'

const { $ } = window

const FileUploader = {
  run: (context) => {
    const { file, dispatch } = context
    const xhrRef = {} // created to track xhr object since activestorage returns error as a string

    const upload = new DirectUpload(
      file,
      context.urls.mediaUploadUrl,
      {
        directUploadWillCreateBlobWithXHR: (xhr) => { xhrRef.createBlobRequest = xhr },
        directUploadWillStoreFileWithXHR: (xhr) => {
          xhr.upload.addEventListener('progress', e => onUploadProgress(e, context.dispatch), false)
        },
      },
    )

    upload.create((error, blob) => {
      if (error) {
        const backendMessage = getBackendErrorMessage(xhrRef)
        const errorMessage = backendMessage || error.errorMessages

        dispatch({ type: SET_ERRORS, payload: { errorMessages: [errorMessage] } })
        context.onFail && context.onFail()
      } else {
        onUploadDone(blob, context)
      }
    }, 'json')
  },
}

export default FileUploader

const onUploadDone = (blob, context) => {
  const {
    urls, dispatch, onSuccessUpload,
  } = context
  $.ajax({
    method: 'PUT',
    url: urls.callbackUrl,
    data: { media_id: blob.media_id, asset_key: blob.signed_id },
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
  }).done((data) => {
    dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    onSuccessUpload(humps.camelizeKeys(data))
  }).fail((data) => {
    const errorMessage = data.responseJSON?.error_message || 'An error occurred while uploading the file'
    dispatch({ type: SET_ERRORS, payload: { errorMessages: [errorMessage] } })
    context.onFail && context.onFail()
  })
}

const onUploadProgress = (e, dispatch) => {
  if (e.lengthComputable) {
    let percent = e.loaded / e.total
    percent = parseInt(percent * 100, 10)
    dispatch({ type: SET_PERCENTAGE, payload: { percent } })
  }
}

const getBackendErrorMessage = xhrRef => xhrRef?.createBlobRequest?.response?.error ?? null
