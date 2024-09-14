import humps from 'humps'
import { DirectUpload } from '@rails/activestorage'
import { SET_UPLOAD_STATE, SET_ERRORS, SET_PERCENTAGE } from './reducer'
import { UPLOAD_STATES } from './constants'

const { $ } = window

const FileUploader = {
  run: (context) => {
    const { file, dispatch } = context
    const upload = new DirectUpload(
      file,
      context.urls.mediaUploadUrl,
      {
        directUploadWillStoreFileWithXHR: (xhr) => {
          xhr.upload.addEventListener('progress', e => onUploadProgress(e, context.dispatch), false)
        },
      },
    )

    upload.create((error, blob) => {
      if (error) {
        dispatch({ type: SET_ERRORS, payload: { errorMessages: [error.errorMessages] } })
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
    dispatch({ type: SET_ERRORS, payload: { errorMessages: [data.responseJSON.error_message] } })
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
