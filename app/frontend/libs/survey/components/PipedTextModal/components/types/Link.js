/* eslint-disable jsx-a11y/interactive-supports-focus */
import React from 'react'

const Link = ({ field, insert }) => (
  <div style={{ marginBottom: 1 }} role="button" onClick={() => insert(field.value)}>
    <a>{field.name}</a>
  </div>
)

export default Link
