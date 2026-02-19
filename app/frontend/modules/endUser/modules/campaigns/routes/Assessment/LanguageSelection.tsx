import React, { useState } from 'react'
import {
  Layout, Col, Typography, Space, Button, Radio, Row,
} from 'antd'
import _ from 'lodash'
import { PageHeader as GlintPageHeader } from '~/glint'
import styles from './UserAssessment.less'

const { Content } = Layout
const { I18n } = window

interface Props {
  locales: string[]
  select: (lang?: string) => void
  onCancel: () => void
}

export const LanguageSelection: React.FC<Props> = ({
  locales, select, onCancel,
}) => {
  const [lang, setLang] = useState(_.first(locales))

  return (
    <>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c" />
        <Col span={24} className="ta-c">
          <Typography.Title level={3}>
            {I18n.t('campaign.language.title')}
          </Typography.Title>
        </Col>
      </GlintPageHeader>
      <Content className={styles.container}>
        <Content className={styles.pageContent}>
          <Row gutter={16}>
            <Col flex={1}>
              <div className={styles.tac}>
                {locales.length > 1
                  ? I18n.t('campaign.language.content')
                  : I18n.t('campaign.language.single_lang', { lang: I18n.t(`languages.${lang}`) })}
              </div>
            </Col>
          </Row>
          {locales.length > 1 && (
            <Row gutter={16}>
              <Col flex={1}>
                <div>
                  <Radio.Group onChange={e => setLang(e.target.value)} value={lang}>
                    <Space orientation="vertical">
                      {_.map(locales, locale => (
                        <Radio value={locale}>{I18n.t(`languages.${locale}`)}</Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          )}
          <div className={styles.footerButtons}>
            <Space>
              <Button danger onClick={onCancel}>
                {I18n.t('campaign.time_left.cancel')}
              </Button>
              <Button type="primary" onClick={() => select(lang)}>
                {I18n.t('campaign.time_left.continue')}
              </Button>
            </Space>
          </div>
        </Content>
      </Content>
    </>
  )
}
