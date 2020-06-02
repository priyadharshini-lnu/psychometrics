import React from 'react'
import './styles.scss'
import Resource from './Resource'

export default function ResourceList ({
  assessment: { resources_content: resourcesContent },
}) {
  return (
    <div>
      {resourcesContent.map((resource, i) => (
        <Resource key={i} resource={resource} />
      ))}
    </div>
  )
}
