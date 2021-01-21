import React, { useEffect } from 'react'
import {
  Layout, PageHeader, Space,
} from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import qs from 'qs'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'
import { isRtl } from 'utils/locales'
import './styles.scss'

const { Content } = Layout
const { I18n } = window

export default function AgileAssign ({
  history,
  isFrame,
  agileAssetsUrl,
}) {
  const initializeAgile = () => {
    const { lang } = qs.parse(location.search.substr(1))
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
        returnURL: '/',
        assetsBaseURL: agileAssetsUrl,
        locale: lang,
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
          backIcon={!isFrame && (
            <Space>
                {rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                {` ${I18n.t('assessments.page.back')}`}
            </Space>
          )}
          onBack={() => history.push('/campaigns')}
        >
          <div id="agile-container" className="agile-container" />
          <div className="mbl" />
        </PageHeader>
      </Content>
    </Layout>
  )
}
