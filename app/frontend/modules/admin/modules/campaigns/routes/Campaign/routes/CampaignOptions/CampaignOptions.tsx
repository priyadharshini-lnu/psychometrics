import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Row, Col, Radio, Tooltip,
} from 'antd'
import snakeCase from 'lodash/snakeCase'
import { QuestionCircleOutlined } from '@ant-design/icons'

import { RootState } from 'modules/admin/core/rootReducers'
import { CampaignOptions as ICampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import {
  fetch,
  update,
  get as getCampaignOptions,
} from 'modules/admin/modules/campaigns/core/campaignOptions'

import TimeZoneSelect from 'components/TimeZoneSelect'
import InputDuration from 'components/InputDuration'
import Section from 'modules/admin/components/Options/Section'
import Option from 'modules/admin/components/Options/Expandable'
import { getFeatures } from 'core/config'
import Instructions from './Instructions'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    options: getCampaignOptions(state),
    features: getFeatures(state),
  }),
  {
    fetch,
    update,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  options: ICampaignOptions
}

type Props = OwnProps & PropsFromRedux

const CampaignOptions: React.FC<Props> = ({
  options,
  fetch,
  update,
  features,
}) => {
  const { projectId, campaignId } = useParams<{ projectId: string, campaignId: string }>()

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

  const parametersForFixedTimeDuration = ({
    value: options.fixedTimeDuration ? options.fixedTimeDuration : 0,
    onChange: (value: number) => update(
      parsedProjectId,
      parsedCampaignId,
      { ...options, fixedTimeDuration: value },
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
    <div className="pt-4 pb-4 ps-4 pe-4">
      <Section>
        <div className="mbl">
          <Row>
            <Col span={24}>
              <Row>
                <Col span={2}>
                  <label>{I18n.t('administration.time_zone')}</label>
                </Col>
                <Col span={8}>
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
                  <Row align="middle">
                    <Col span={5} offset={2}>
                      <InputDuration
                        placeholder={I18n.t('administration.components.input_duration.placeholder')}
                        {...parametersForFixedTimeDuration}
                      />
                    </Col>
                    <Col>
                      <Tooltip title={I18n.t('administration.components.input_duration.placeholder')}>
                        <QuestionCircleOutlined className="ms-4" />
                      </Tooltip>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            {/* Features Check */}
            {features.proctoring && (
              <>
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
            {/* End Features Check */}
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

export default connector(CampaignOptions)
