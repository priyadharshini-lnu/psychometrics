import mime from 'mime-types'
import sanitize from 'utils/sanitizeFileName'
import humps from 'humps'
import { SET_UPLOAD_STATE, SET_ERRORS, SET_PERCENTAGE } from './reducer'
import { UPLOAD_STATES } from './constants'

const { $ } = window

const FileUploader = {
  run: (context) => {
    const { file, fileName } = context
    $.get(`${context.urls.mediaUploadUrl}?file_name=${fileName || file.name}`,
      (data) => {
        uploadFile(data, context)
      }, 'json')
  },
}

export default FileUploader

const uploadFile = (data, context) => {
  const { file, fileName, dispatch } = context

  $.ajax({
    method: 'PUT',
    url: data.url,
    data: file,
    processData: false,
    contentType: mime.lookup(fileName || file.name),
    xhr: () => {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', e => onUploadProgress(e, dispatch), false)
      return xhr
    },
  }).done((media) => {
    onUploadDone(media, data, context)
  }).fail((e) => {
    dispatch({ type: SET_ERRORS, payload: { errorCodes: [e.responseXML.querySelector('Error Code').innerHTML] } })
  })
}

const onUploadDone = (media, data, context) => {
  const {
    urls, file, fileName, dispatch, onSuccessUpload,
  } = context
  const mediaId = data.media_id
  const assetKey = data.key.replace('${filename}', fileName || sanitize(file.name))
  $.ajax({
    method: 'PUT',
    url: urls.callbackUrl,
    data: { media_id: mediaId, asset_key: assetKey },
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
  }).done((data) => {
    dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    onSuccessUpload(humps.camelizeKeys(data))
  }).fail((data) => {
    dispatch({ type: SET_ERRORS, payload: { errorMessages: [data.responseJSON.error_message] } })
  })
}

const onUploadProgress = (e, dispatch) => {
  if (e.lengthComputable) {
    let percent = e.loaded / e.total
    percent = parseInt(percent * 100, 10)
    dispatch({ type: SET_PERCENTAGE, payload: { percent } })
  }
}
