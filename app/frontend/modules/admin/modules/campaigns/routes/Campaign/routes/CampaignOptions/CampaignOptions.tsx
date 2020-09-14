import React, { useEffect } from 'react'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import Campaign, { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import styles from './styles.scss'

interface Props {
  options: ICampaignOptions
  fetch: (projectId: number, id: number) => void
  update: (projectId: number, id: number, data: Partial<Campaign>) => void
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const CampaignOptions: React.FC<Props> = ({
  options, update, fetch, match: { params: { projectId, campaignId } },
}) => {
  useEffect(() => {
    fetch(parseInt(campaignId, 10), parseInt(projectId, 10))
  }, [])

  const parametersForSwitch = name => ({
    value: (options || {})[name],
    onOptionChanged: (value) => {
      update(parseInt(campaignId, 10), parseInt(projectId, 10), { campaignOptions: { ...options, [name]: value } })
    },
  })

  return (
    <div className={styles.container}>
      <Section>
        <Option
          label="Enable assessments in sequential order when the previous one is completed"
          {...parametersForSwitch('enableAssessmentsInSequentialOrder')}
        />

      </Section>
    </div>
  )
}

export default CampaignOptions
