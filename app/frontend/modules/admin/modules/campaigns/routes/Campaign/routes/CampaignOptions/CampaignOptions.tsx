import React, { useEffect } from 'react'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import TimeZoneSelect from 'components/TimeZoneSelect'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import DurationSelect from 'components/DurationSelect'
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

  const parametersForField = name => ({
    value: (options || {})[name],
    onChange: (value) => {
      update(parseInt(projectId, 10), parseInt(campaignId, 10), { ...options, [name]: value })
    },
  })

  return (
    <div className={styles.container}>
      <Section>
        <TimeZoneSelect
          label={I18n.t('administration.time_zone')}
          {...parametersForField('timeZone')}
        />

        <Option
          label={I18n.t('administration.campaigns.time_zone')}
          {...parametersForField('fixedTime')}
        />

        {options.fixedTime && (
          <DurationSelect
            label={I18n.t('administration.campaigns.duration')}
            style={{ marginLeft: 110 }}
            {...parametersForField('fixedTimeDuration')}
          />
        )}
      </Section>
    </div>
  )
}

export default CampaignOptions
