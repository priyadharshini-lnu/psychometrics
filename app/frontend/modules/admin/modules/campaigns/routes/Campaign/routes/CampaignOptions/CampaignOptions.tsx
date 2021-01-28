import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import TimeZoneSelect from 'components/TimeZoneSelect'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import DurationSelect from 'components/DurationSelect'
import {
  Row, Col, Radio,
} from 'antd'
import { snakeCase } from 'lodash'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'
import Instructions from './Instructions'

const { I18n } = window

interface OwnProps {
  options: ICampaignOptions
}

interface Params {
  projectId: string
  campaignId: string
}

const CampaignOptions: React.FC<OwnProps & RouteComponentProps<Params> & PropsFromRedux> = ({
  options,
  fetch, update, match: { params: { projectId, campaignId } },
}) => {
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)

  const identifications = I18n.t('administration.campaigns.options.proctoring.identifications')

  useEffect(() => {
    fetch(parsedProjectId, parsedCampaignId)
  }, [])


  const parametersForField = name => ({
    value: (options || {})[name],
    onChange: (value: string | number) => update(
      parsedProjectId, parsedCampaignId, { ...options, [name]: value },
    ),
  })

  const parametersForRules = name => ({
    value: !!(options.rules || {})[name],
    onChange: (value: boolean) => update(
      parsedProjectId, parsedCampaignId, { ...options, rules: { ...options.rules, [name]: value } },
    ),
  })

  const saveIdentificationType = (e) => {
    const { value } = e.target
    update(parsedProjectId, parsedCampaignId, { ...options, identification: value })
  }

  return (
    <div className={styles.container}>
      <Section>
        <div className="mbl">
          <Row>
            <Col span={24}>
              <Row>
                <Col span={2}><label>{I18n.t('administration.time_zone')}</label></Col>
                <Col span={22}>
                  <TimeZoneSelect
                    {...parametersForField('timeZone')}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <Option
          label={I18n.t('administration.campaigns.options.fixed_time')}
          {...parametersForField('fixedTime')}
        />

        {options.fixedTime && (
          <>
            <div className="mbl">
              <Row>
                <Col span={24}>
                  <Row>
                    <Col span={22} offset={2}>
                      <DurationSelect
                        className={styles.durationSelect}
                        {...parametersForField('fixedTimeDuration')}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>

            <Option
              label={I18n.t('administration.campaigns.options.proctoring.enable')}
              {...parametersForField('proctoringEnabled')}
            />

            <div className="mbl">
              <Row>
                <Col span={2}>
                  <label>{I18n.t('administration.campaigns.options.proctoring.rules')}</label>
                </Col>
                <Col span={22}>
                  {Object.keys(options.rules || {}).map(
                    key => (
                      <Option
                        key={key}
                        label={I18n.t(`administration.campaigns.options.proctoring.rule_types.${snakeCase(key)}`)}
                        {...parametersForRules(key)}
                      />
                    ),
                  )}
                </Col>
              </Row>
            </div>

            <div className="mbl">
              <Row>
                <Col span={24}>
                  <Row>
                    <Col span={2}>
                      <label>
                        {I18n.t('administration.campaigns.options.proctoring.identification')}
                      </label>
                    </Col>
                    <Col span={22}>
                      <Radio.Group defaultValue="passport" onChange={saveIdentificationType}>
                        {Object.entries(identifications).map(
                          ([key, value]) => <Radio key={key} value={key}>{value as string}</Radio>,
                        )}
                      </Radio.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </>
        )}

        <Option
          label={I18n.t('administration.campaigns.options.instructions.enable')}
          {...parametersForField('instructionsEnabled')}
        />

        {options.instructionsEnabled && <Instructions projectId={parsedProjectId} campaignId={parsedCampaignId} />}
      </Section>
    </div>
  )
}

export default CampaignOptions
