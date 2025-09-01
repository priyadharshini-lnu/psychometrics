import React from 'react'
import CampaignAIArtifacts from '~/modules/reports/components/DataSourceMenu/types/CampaignAIArtifacts'

interface ModuleSource {
  type: string
  codes?: string[]
  key?: string
}

interface ModuleProps {
  source?: ModuleSource
}

interface Module {
  props: ModuleProps
}

interface Props {
  modules: Module[]
  update: () => void
}

const AIContent: React.FC<Props> = ({ modules, update }) => {
  const onSelect = (): void => {
    modules.forEach((module) => {
      if (!module.props.source || module.props.source.type !== 'CampaignAIArtifacts') {
        module.props.source = { type: 'CampaignAIArtifacts' }
      }
    })
    update()
  }

  return (
    <div>
      <CampaignAIArtifacts
        modules={modules}
        onSelect={onSelect}
      />
    </div>
  )
}

export default AIContent
