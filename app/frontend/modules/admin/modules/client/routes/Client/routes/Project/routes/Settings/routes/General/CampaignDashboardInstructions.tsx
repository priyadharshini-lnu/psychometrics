import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Row, Col, Button, Select, Input, App, Spin,
} from 'antd'
import { SaveOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources/useResources'
import {
  ProjectGeneralSettings as GeneralSettingsType,
} from '~/modules/admin/modules/client/core/projectGeneralSettings'

import styles from './CampaignDashboardInstructions.less'

const { I18n } = window
const { TextArea } = Input

interface CampaignDashboardInstructionsData {
  [locale: string]: string
}

interface CampaignDashboardInstructionItem {
  locale: string
  campaignDashboardInstructions: string | null
}

interface FetchCampaignDashboardInstructionsResponse {
  availableLocales?: string[]
  list: CampaignDashboardInstructionItem[]
}

export const CampaignDashboardInstructions: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const [savingInProgress, setSavingInProgress] = useState(false)
  const [leftLocale, setLeftLocale] = useState('en')
  const [rightLocale, setRightLocale] = useState<string | null>(null)
  const [instructionsLoading, setInstructionsLoading] = useState(false)
  const [instructionsByLocale, setInstructionsByLocale] = useState<CampaignDashboardInstructionsData>({})
  const [availableLocales, setAvailableLocales] = useState<string[]>([])
  const [savedLocales, setSavedLocales] = useState<string[]>([])
  const { message } = App.useApp()

  const {
    data,
    fetchSingle,
    memberAction,
  } = useResources<GeneralSettingsType>('projects')
  const [projectData] = data

  const fetchCampaignDashboardInstructions = (locales: string[]) => memberAction({
    id: projectId,
    action: 'fetch_campaign_dashboard_instructions',
    method: 'post',
    body: { locales },
  }) as Promise<FetchCampaignDashboardInstructionsResponse>

  const fetchInstructions = (locales: (string | null)[]) => {
    const validLocales = locales.filter(Boolean) as string[]
    if (validLocales.length === 0) return

    setInstructionsLoading(true)

    fetchCampaignDashboardInstructions(validLocales)
      .then((response) => {
        if (response.availableLocales) {
          setSavedLocales(response.availableLocales)
        }

        setInstructionsByLocale((prev) => {
          const updated = { ...prev }
          response.list.forEach((item) => {
            updated[item.locale] = item.campaignDashboardInstructions || ''
          })
          return updated
        })
      })
      .catch(() => {
        message.error(I18n.t('admin.campaign_dashboard_instructions_save_error'))
      })
      .finally(() => {
        setInstructionsLoading(false)
      })
  }

  useEffect(() => {
    fetchSingle({ id: projectId })
  }, [projectId])

  useEffect(() => {
    if (projectData) {
      const locales = (projectData.locales?.length > 0) ? projectData.locales : ['en']
      setAvailableLocales(locales)
      const initialLocale = locales.includes('en') ? 'en' : locales[0]
      setLeftLocale(initialLocale)
      fetchInstructions([initialLocale, rightLocale])
    }
  }, [projectData])

  const updateLeftLocale = (locale: string) => {
    setLeftLocale(locale)
    fetchInstructions([locale, rightLocale])
  }

  const updateRightLocale = (locale: string) => {
    const newRight = locale || null
    setRightLocale(newRight)
    if (newRight) fetchInstructions([leftLocale, newRight])
  }

  const saveInstructions = () => {
    setSavingInProgress(true)
    memberAction({
      id: projectId,
      action: 'update_campaign_dashboard_instructions',
      method: 'post',
      body: {
        campaign_dashboard_instructions: instructionsByLocale[leftLocale] ?? null,
        locale: leftLocale,
      },
    }).then(() => {
      setSavingInProgress(false)
      fetchInstructions([leftLocale, rightLocale])
      message.success(I18n.t('admin.campaign_dashboard_instructions_save_success'))
    }).catch(() => {
      setSavingInProgress(false)
      message.error(I18n.t('admin.campaign_dashboard_instructions_save_error'))
    })
  }

  if (availableLocales.length === 0) {
    return null
  }

  return (
    <Row>
      <Col span={24}>
        <div className="mb8">
          <strong>{I18n.t('admin.campaign_dashboard_instructions_label')}</strong>
        </div>
      </Col>
      <Col span={24}>
        <div className="display-flex justify-content-space-between mt8">
          <Select value={leftLocale} className="mb8 width150px" onChange={updateLeftLocale}>
            {availableLocales.map(locale => (
              <Select.Option key={locale} value={locale}>
                {I18n.t(`languages.${locale}`)}
              </Select.Option>
            ))}
          </Select>
          <div>
            <span className="mr8">{I18n.t('common.text.reference_language')}</span>
            <Select className="mb8 width150px" placeholder={I18n.t('common.text.none')} onChange={updateRightLocale}>
              <Select.Option value="">
                {I18n.t('common.text.none')}
              </Select.Option>
              {savedLocales.map(locale => (
                <Select.Option key={locale} value={locale}>
                  {I18n.t(`languages.${locale}`)}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Col>
      <Col span={24}>
        <Spin spinning={instructionsLoading}>
          <div className="display-flex">
            <TextArea
              className="flex1"
              value={instructionsByLocale[leftLocale] ?? ''}
              onChange={e => setInstructionsByLocale(prev => ({ ...prev, [leftLocale]: e.target.value }))}
              rows={6}
              maxLength={500}
              showCount
            />
            {rightLocale && (
              <div className={styles.comparisonBody}>
                <div className="m16">
                  {instructionsByLocale[rightLocale] ?? ''}
                </div>
              </div>
            )}
          </div>
        </Spin>
        <Button
          type="primary"
          className="mtm"
          onClick={saveInstructions}
          loading={savingInProgress}
        >
          <SaveOutlined />
          {I18n.t('admin.campaign_dashboard_instructions_save')}
        </Button>
      </Col>
    </Row>
  )
}
