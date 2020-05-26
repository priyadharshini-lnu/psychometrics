import { SET_UPLOAD_STATE, SET_ERRORS, SET_PERCENTAGE } from './reducer'
import { UPLOAD_STATES } from './constants'

const { $ } = window

const FileUploader = {
  run: context => $.get(context.urls.mediaUploadUrl,
    (data) => {
      uploadFile(data, context)
    }),
}

export default FileUploader

const uploadFile = (data, context) => {
  const { file, fileName, dispatch } = context
  const fd = new FormData()
  fd.append('key', data.key)
  fd.append('acl', data.acl)
  fd.append('success_action_status', data.success_action_status)
  fd.append('policy', data.policy)
  fd.append('x-amz-algorithm', data['x-amz-algorithm'])
  fd.append('x-amz-credential', data['x-amz-credential'])
  fd.append('x-amz-date', data['x-amz-date'])
  fd.append('x-amz-signature', data['x-amz-signature'])
  fd.append('file', file, fileName || file.name)

  $.ajax({
    method: 'POST',
    url: data.url,
    data: fd,
    processData: false,
    contentType: false,
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
  const assetKey = data.key.replace('${filename}', fileName || file.name)
  $.ajax({
    method: 'PUT',
    url: urls.callbackUrl,
    data: { media_id: mediaId, asset_key: assetKey },
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
  }).done((data) => {
    dispatch({ type: SET_UPLOAD_STATE, payload: { uploadState: UPLOAD_STATES.SAVED } })
    onSuccessUpload(data)
  }).fail((data) => {
    dispatch({ type: SET_ERRORS, payload: { errorCodes: [data.responseJSON.error_message] } })
  })
}

const onUploadProgress = (e, dispatch) => {
  if (e.lengthComputable) {
    let percent = e.loaded / e.total
    percent = parseInt(percent * 100, 10)
    dispatch({ type: SET_PERCENTAGE, payload: { percent } })
  }
}
