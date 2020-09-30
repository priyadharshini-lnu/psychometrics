import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import TimeZoneSelect from 'components/TimeZoneSelect'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import DurationSelect from 'components/DurationSelect'
import Editor from 'components/Editor'
import { Button } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'

const { I18n } = window

interface OwnProps {
  options: ICampaignOptions
}

interface Params {
  projectId: string
  campaignId: string
}

const CampaignOptions: React.FC<OwnProps & RouteComponentProps<Params> & PropsFromRedux> = ({
  options, fetch, update, match: { params: { projectId, campaignId } },
}) => {
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)

  const [instructions, updateInstructions] = useState(options.instructions)

  useEffect(() => {
    fetch(parsedProjectId, parsedCampaignId)
  }, [])

  const parametersForField = name => ({
    value: (options || {})[name],
    onChange: (value: string | number) => {
      update(parsedProjectId, parsedCampaignId, { ...options, [name]: value })
    },
  })

  const saveInstructions = () => {
    update(parsedProjectId, parsedCampaignId, { ...options, instructions })
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
            className={styles.durationSelect}
            {...parametersForField('fixedTimeDuration')}
          />
        )}

        <Option
          label={I18n.t('administration.campaigns.options.instructions.enable')}
          {...parametersForField('instructionsEnabled')}
        />

        {options.instructionsEnabled && (
          <>
            <div className={styles.content}>
              <Editor
                type={null}
                details={null}
                className={null}
                content={options.instructions}
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
