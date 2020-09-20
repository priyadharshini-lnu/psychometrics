import React, { useEffect } from 'react'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import TimeZoneSelect from 'components/TimeZoneSelect'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import styles from './styles.scss'

const { I18n } = window

interface Props {
  options: ICampaignOptions
  fetch: (projectId: number, campaignId: number) => void
  update: (projectId: number, campaginId: number, data: Partial<ICampaignOptions>) => void
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const CampaignOptions: React.FC<Props> = ({
  options, fetch, update, match: { params: { projectId, campaignId } },
}) => {
  useEffect(() => {
    fetch(parseInt(projectId, 10), parseInt(campaignId, 10))
  }, [])

  const parametersForSwitch = name => ({
    value: (options || {})[name],
    onOptionChanged: (value) => {
      update(parseInt(projectId, 10), parseInt(campaignId, 10), { ...options, [name]: value })
    },
  })

  const parametersForSelect = name => ({
    value: (options || {})[name],
    onChange: (value) => {
      update(parseInt(projectId, 10), parseInt(campaignId, 10), { ...options, [name]: value })
    },
  })

  return (
    <div className={styles.container}>
      <TimeZoneSelect
        label={I18n.t('administration.time_zone')}
        {...parametersForSelect('timeZone')}
      />

      <Section>
        <Option
          label="Fixed Time"
          {...parametersForSwitch('fixedTime')}
        />
      </Section>
    </div>
  )
}

export default CampaignOptions
