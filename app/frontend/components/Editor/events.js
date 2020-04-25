const events = {
  video_code_error (editorRef, code) {
    const $popup = editorRef.popups.get('video.insert')
    const $layer = $popup.find('.fr-video-progress-bar-layer')
    if (code === '') {
      $layer.find('h3').text('Use <embed> tag to insert a video.')
    } else {
      $layer.find('h3').text('Enter a valid structured <embed> script.')
    }
  },
  video_link_error (editorRef, link) {
    const $popup = editorRef.popups.get('video.insert')
    const $layer = $popup.find('.fr-video-progress-bar-layer')
    if (link.split('://')[1] === '') {
      $layer.find('h3').text('Enter a video url.')
    } else if (editorRef.helpers.isURL(link)) {
      $layer.find('h3').text('Enter a valid video url eg. YouTube, Vimeo')
    }
  },
}

export default events
