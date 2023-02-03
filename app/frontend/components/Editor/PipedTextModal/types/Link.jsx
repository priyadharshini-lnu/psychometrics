import React from 'react'

const Link = ({ field, insert }) => (
  <div role="button" tabIndex="0" onClick={() => insert(field.value)}>
    <a>{field.name}</a>
  </div>
)

export default Link
