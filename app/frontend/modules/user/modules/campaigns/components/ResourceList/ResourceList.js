import React from 'react'
import './styles.less'
import Resource from './Resource'

export default function ResourceList ({
  assessment: { resources_content: resourcesContent, resources_translations: translations },
}) {
  return (
    <div className="resource-list">
      {resourcesContent.map((resource, i) => (
        <Resource key={i} resource={resource} translations={translations && translations.question} />
      ))}
    </div>
  )
}
