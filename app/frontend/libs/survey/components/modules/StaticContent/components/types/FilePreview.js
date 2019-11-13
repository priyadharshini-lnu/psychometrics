import React from 'react'

const FilePreview = ({ model }) => (
  <a target="_blank" rel="noopener noreferrer" href={model.props.graphicUrl}>
    {model.props.graphicUrl}
  </a>
)
export default FilePreview
