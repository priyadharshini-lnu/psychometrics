import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Button, Select, Input, Typography, App,
} from 'antd'
import find from 'lodash/find'
import { SaveOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  fetchDescriptions,
  update,
  updateDescriptions,
  get as getCampaignOptions,
} from '~/modules/admin/modules/campaigns/core/campaignOptions'
import { RootState } from '~/modules/admin/core/rootReducers'

import styles from './Description.less'

const { I18n } = window


const connecter = connect(
  (state: RootState) => ({
    options: getCampaignOptions(state),
    availableLocales: state.config.availableLocales,
  }),
  {
    fetchDescriptions,
    update,
    updateDescriptions,
  },
)
interface OwnProps {
  projectId: number
  campaignId: number
}
export type PropsFromRedux = ConnectedProps<typeof connecter>
export type Props = OwnProps & PropsFromRedux
const { TextArea } = Input
const { Text } = Typography

const DescriptionComponent: React.FC<Props> = ({
  options,
  fetchDescriptions, update, projectId, campaignId, availableLocales, updateDescriptions,
}) => {
  const [savingInProgress, setSavingInProgress] = useState(false)
  const [leftLocale, setLeftLocale] = useState('en')
  const [rightLocale, setRightLocale] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { message } = App.useApp()

  useEffect(() => {
    fetchDescriptions(projectId, campaignId, [leftLocale, rightLocale])
  }, [])


  const updateLeftLocale = (locale: string) => {
    setLeftLocale(locale)
    fetchDescriptions(projectId, campaignId, [locale, rightLocale])
  }

  const updateRightLocale = (locale: string) => {
    setRightLocale(locale)
    fetchDescriptions(projectId, campaignId, [leftLocale, locale])
  }

  const saveDescriptions = () => {
    setSavingInProgress(true)
    update(
      projectId, campaignId, { ...options, ...selectedLeftLocale }, leftLocale,
    ).then(() => {
      setErrors({})
      message.success(I18n.t('admin.description_save_success'))
    }).catch(setErrors).finally(() => {
      setSavingInProgress(false)
    })
  }

  const selectedLeftLocale = find(options.descriptionsWithLocales, (
    { locale },
  ) => locale === leftLocale)
  const selectedRightLocale = find(options.descriptionsWithLocales, (
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
            <Select
              className="mb8 width150px"
              placeholder={I18n.t('select')}
              onChange={updateRightLocale}
              defaultValue=""
            >
              <Select.Option value="">
                {I18n.t('common.text.none')}
              </Select.Option>
              {(options.availableDescriptionLocales || []).map(locale => (
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
          <TextArea
            rows={3}
            className="flex1"
            value={selectedLeftLocale?.description ? selectedLeftLocale.description : ''}
            onChange={({ target: { value } }) => { updateDescriptions(value, leftLocale) }}
            status={errors?.description ? 'error' : ''}
          />
          {rightLocale && (
            <div className={styles.comparisonBody}>
              <div className="m16">
                {selectedRightLocale ? selectedRightLocale.description : ''}
              </div>
            </div>
          )}
        </div>
        {errors?.description && <div><Text type="danger">{errors?.description}</Text></div>}
        <Button
          type="primary"
          className="mtm"
          onClick={saveDescriptions}
          loading={savingInProgress}
        >
          <SaveOutlined />
          {I18n.t('admin.description_save')}
        </Button>
      </Col>
    </Row>
  )
}

export const Description = connecter(DescriptionComponent)
