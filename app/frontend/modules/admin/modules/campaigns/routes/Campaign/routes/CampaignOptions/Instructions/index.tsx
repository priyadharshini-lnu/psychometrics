import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Button, Select, App,
} from 'antd'
import find from 'lodash/find'
import { SaveOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Editor from '~/components/Editor'
import {
  fetchInstructions,
  update,
  updateInstructions,
  get as getCampaignOptions,
} from '~/modules/admin/modules/campaigns/core/campaignOptions'
import { RootState } from '~/modules/admin/core/rootReducers'

import { SafeHTML } from '~/components/SafeHTML'

import styles from './styles.less'

const { I18n } = window

interface OwnProps {
  projectId: number
  campaignId: number
}

const connecter = connect(
  (state: RootState) => ({
    options: getCampaignOptions(state),
    availableLocales: state.config.availableLocales,
  }),
  {
    fetchInstructions,
    update,
    updateInstructions,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>


const Instructions: React.FC<OwnProps & PropsFromRedux> = ({
  options,
  fetchInstructions, update, projectId, campaignId, availableLocales, updateInstructions,
}) => {
  const [savingInProgress, setSavingInProgress] = useState(false)
  const [leftLocale, setLeftLocale] = useState('en')
  const [rightLocale, setRightLocale] = useState(null)
  const { message } = App.useApp()

  useEffect(() => {
    fetchInstructions(projectId, campaignId, [leftLocale, rightLocale])
  }, [])


  const updateLeftLocale = (locale) => {
    setLeftLocale(locale)
    fetchInstructions(projectId, campaignId, [locale, rightLocale])
  }

  const updateRightLocale = (locale) => {
    setRightLocale(locale)
    fetchInstructions(projectId, campaignId, [leftLocale, locale])
  }

  const saveInstructions = () => {
    setSavingInProgress(true)
    update(
      projectId, campaignId, { ...options, ...selectedLeftLocale }, leftLocale,
    ).then(() => {
      setSavingInProgress(false)
      message.success(I18n.t('admin.instructions_actions_saved'))
    })
  }

  const selectedLeftLocale = find(options.instructionsWithLocales, (
    { locale },
  ) => locale === leftLocale)
  const selectedRightLocale = find(options.instructionsWithLocales, (
    { locale },
  ) => locale === rightLocale)

  return (

    <Row>
      <Col span={24}>
        <div className="display-flex justify-content-space-between mt8">
          <Select defaultValue="en" className="mb8 width150px" onChange={updateLeftLocale}>
            {availableLocales.map(locale => (
              <Select.Option key={locale} value={locale}>
                {I18n.t(`languages.${locale}`)}
              </Select.Option>
            ))}
          </Select>
          <div>
            <span className="mr8">{I18n.t('common.text.reference_language')}</span>
            <Select className="mb8 width150px" placeholder={I18n.t('select')} onChange={updateRightLocale}>
              <Select.Option value="">
                {I18n.t('common.text.none')}
              </Select.Option>
              {(options.availableInstructionLocales || []).map(locale => (
                <Select.Option key={locale} value={locale}>
                  {I18n.t(`languages.${locale}`)}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Col>
      <Col span={24}>
        <div className="display-flex">
          <Editor
            type={null}
            details={null}
            className="flex1"
            content={selectedLeftLocale ? selectedLeftLocale.instructions : ''}
            handleContentChange={(value) => { updateInstructions(value, leftLocale) }}
          />
          {rightLocale && (
            <div className={styles.comparisonBody}>
              <SafeHTML
                html={selectedRightLocale ? selectedRightLocale.instructions : ''}
                config="adminRichText"
                className="m16"
              />
            </div>
          )}
        </div>
        <Button
          type="primary"
          className="mtm"
          onClick={saveInstructions}
          loading={savingInProgress}
        >
          <SaveOutlined />
          {I18n.t('admin.instructions_save')}
        </Button>
      </Col>
    </Row>
  )
}

export default connecter(Instructions)
