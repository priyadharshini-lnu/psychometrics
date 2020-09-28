import React, { useState, useEffect } from 'react'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import TimeZoneSelect from 'components/TimeZoneSelect'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import DurationSelect from 'components/DurationSelect'
import Editor from 'components/Editor'
import { Button } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
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
  const [instructions, updateInstructions] = useState(options.instructions)

  useEffect(() => {
    fetch(parseInt(projectId, 10), parseInt(campaignId, 10))
  }, [])

  const parametersForField = name => ({
    value: (options || {})[name],
    onChange: (value) => {
      update(parseInt(projectId, 10), parseInt(campaignId, 10), { ...options, [name]: value })
    },
  })

  const saveInstructions = () => {
    update(parseInt(projectId, 10), parseInt(campaignId, 10), { ...options, instructions })
  }

  return (
    <div className={styles.container}>
      <Section>
        <TimeZoneSelect
          label={I18n.t('administration.time_zone')}
          {...parametersForField('timeZone')}
        />

        <Option
          label={I18n.t('administration.campaigns.options.fixed_time')}
          {...parametersForField('fixedTime')}
        />

        {options.fixedTime && (
          <DurationSelect
            label={I18n.t('administration.campaigns.options.duration')}
            style={{ marginLeft: 110 }}
            {...parametersForField('fixedTimeDuration')}
          />
        )}

        <Option
          label={I18n.t('administration.campaigns.options.instructions.enabled')}
          {...parametersForField('instructionsEnabled')}
        />

        {options.instructionsEnabled && (
          <>
            <div className={styles.content}>
              <Editor
                type={null}
                details={null}
                className={null}
                content={instructions}
                handleContentChange={(value) => { updateInstructions(value) }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              className="mtm"
              onClick={saveInstructions}
            >
              <SaveOutlined />
              Save
            </Button>
          </>
        )}
      </Section>
    </div>
  )
}

export default CampaignOptions
