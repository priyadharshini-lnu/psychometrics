import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import TimeZoneSelect from 'components/TimeZoneSelect'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import DurationSelect from 'components/DurationSelect'
import Editor from 'components/Editor'
import NotificationDispatcher from 'libs/library/dispatchers/NotificationDispatcher'
import {
  Row, Col, Button, Radio,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { snakeCase } from 'lodash'
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

  const [instructions, setInstructions] = useState(options.instructions)
  const [savingInProgress, setSavingInProgress] = useState(false)

  const identifications = I18n.t('administration.campaigns.options.proctoring.identifications')

  useEffect(() => {
    fetch(parsedProjectId, parsedCampaignId)
  }, [])

  const parametersForField = name => ({
    name,
    value: (options || {})[name],
    onChange: (value: string | number) => update(parsedProjectId, parsedCampaignId, { ...options, [name]: value }),
  })

  const parametersForRules = name => ({
    name,
    value: !!(options.rules || {})[name],
    onChange: (value: boolean) => update(
      parsedProjectId, parsedCampaignId, { ...options, rules: { ...options.rules, [name]: value } },
    ),
  })

  const saveIdentificationType = (e) => {
    const { value } = e.target
    update(parsedProjectId, parsedCampaignId, { ...options, identification: value })
  }

  const saveInstructions = () => {
    setSavingInProgress(true)
    update(parsedProjectId, parsedCampaignId, { ...options, instructions }).then(() => {
      setSavingInProgress(false)
      NotificationDispatcher.notify({ message: I18n.t('administration.campaigns.options.instructions.actions.saved') })
    })
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
                      <Radio.Group defaultValue="passport" buttonStyle="solid" onChange={saveIdentificationType}>
                        {Object.entries(identifications).map(
                          ([key, value]) => <Radio.Button key={key} value={key}>{value as string}</Radio.Button>,
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

        {options.instructionsEnabled && (
          <Row>
            <Col span={24}>
              <Row>
                <Col span={16} offset={2}>
                  <Editor
                    type={null}
                    details={null}
                    className={null}
                    content={instructions || options.instructions}
                    handleContentChange={(value) => { setInstructions(value) }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    className="mtm"
                    onClick={saveInstructions}
                    loading={savingInProgress}
                  >
                    <SaveOutlined />
                    {I18n.t('administration.campaigns.options.instructions.save')}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Section>
    </div>
  )
}

export default CampaignOptions
