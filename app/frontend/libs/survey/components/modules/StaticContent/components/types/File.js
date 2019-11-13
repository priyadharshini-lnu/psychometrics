import React from 'react'

const File = ({ model }) => {
  const { props: { graphicUrl } } = model
  if (graphicUrl) {
    return (<a target="_blank" rel="noopener noreferrer" href={graphicUrl}>{graphicUrl}</a>)
  }
  return (<div>Select a file</div>)
}
export default File
