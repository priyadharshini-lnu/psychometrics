import styles from './ResourceList.less'
import { Resource } from './Resource'

export const ResourceList = ({
  assessment: { resources_content: resourcesContent, resources_translations: translations },
}) => (
  <div className={styles.resourceList}>
    {resourcesContent.map((resource, i) => (
      <Resource key={i} resource={resource} translations={translations && translations.question} />
    ))}
  </div>
)
