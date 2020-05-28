/* eslint-disable react/no-danger */
import React from 'react'
import './styles.scss'

export default function Resource ({ resource }) {
  return (
    <div className="resource-content" dangerouslySetInnerHTML={{ __html: resource.props.questionText }} />
  )
}
