import React, { useEffect } from 'react'
import OptionSection from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import Campaign, { Options as OptionsInterface } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import styles from './styles.scss'

interface Props {
  options: OptionsInterface
  fetch: (projectId: number, id: number) => void
  update: (projectId: number, id: number, data: Partial<Campaign>) => void
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const Options: React.FC<Props> = ({
  options, update, fetch, match: { params: { projectId, campaignId } },
}) => {
  useEffect(() => {
    fetch(parseInt(campaignId, 10), parseInt(projectId, 10))
  }, [])

  const parametersForSwitch = name => ({
    value: (options || {})[name],
    onOptionChanged: (value) => {
      update(parseInt(campaignId, 10), parseInt(projectId, 10), { options: { ...options, [name]: value } })
    },
  })

  return (
    <div className={styles.container}>
      <OptionSection>
        <Option
          label="Enable assessments in sequential order when the previous one is completed"
          {...parametersForSwitch('enableAssessmentsInSequentialOrder')}
        />

      </OptionSection>
    </div>
  )
}

export default Options
