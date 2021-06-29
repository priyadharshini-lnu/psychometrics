import React, { useEffect } from 'react'
import {
  Layout, PageHeader, Space,
} from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'
import { isRtl } from 'utils/locales'
import { isInsideIframe } from 'utils/isInsideIframe'
import './styles.scss'

const { Content } = Layout
const { I18n } = window

export default function AgileAssign ({
  agileAssetsUrl,
}) {
  const initializeAgile = () => {
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: window.location.href.split('?')[0],
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
        },
      },
      settings: {
        returnURL: '/assessment_completed',
        assetsBaseURL: agileAssetsUrl,
      },
    }

    InteractiveAssessments.init(appOptions)
  }

  useEffect(() => {
    initializeAgile()
  }, [])
  const rtl = isRtl(I18n.uiLocale)
  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={!isInsideIframe() && (
            <Space>
                {rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                {` ${I18n.t('assessments.page.back')}`}
            </Space>
          )}
          onBack={() => { window.location.href = '/campaigns' }}
        >
          <div id="agile-container" className="agile-container" />
          <div className="mbl" />
        </PageHeader>
      </Content>
    </Layout>
  )
}
