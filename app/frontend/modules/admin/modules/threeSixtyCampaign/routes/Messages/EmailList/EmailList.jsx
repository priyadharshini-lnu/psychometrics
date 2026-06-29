import { useEffect, useState } from 'react'
import {
  Input, Row, Col, Button, Empty, App, Switch, Select, TimePicker,
} from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { useNavigate, useParams } from 'react-router-dom'
import { SaveOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { CONSOLIDATED_EMAIL_NAMES, DAILY_DIGEST_EMAILS } from '~/modules/admin/constants/emailTemplate'
import EmailEditor from '~/components/EmailEditor'
import { SafeHTML } from '~/components/SafeHTML'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import routeUtils from '~/utils/route'
import TitleBar from './TitleBar'
import settings from '../../../settings'
import styles from './styles.less'
import TemplateMenu from './TemplateMenu'
import FooterBar from './FooterBar'
import SentTestEmailModal from './SendTestEmailModal'
import EmailScheduleModal from './EmailScheduleModal'

const { Option } = Select

export default function Emails ({
  availableLocales,
  emailTemplates,
  emailTemplates: { list, listWithLocales },
  fetch,
  update,
  fetchByLocales,
  save,
  openModal,
}) {
  const { message } = App.useApp()
  const { campaignId, id: selectedId } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    fetch(campaignId)
      .then(({ response }) => {
        if (!selectedId) {
          routeUtils.moveTo(navigate, settings.urlPrefix, `/messages/email/${response[0].id}`)
        }
      })
  }, [])

  useEffect(() => {
    if (selectedId) { fetchByLocales(campaignId, selectedId, [leftLocale, rightLocale]) }
  }, [selectedId])

  const [errors, setErrors] = useState(null)
  const [leftLocale, setLeftLocale] = useState('en')
  const [rightLocale, setRightLocale] = useState(null)

  const updateLeftLocale = (locale) => {
    setLeftLocale(locale)
    fetchByLocales(campaignId, selectedId, [locale, rightLocale])
  }

  const updateRightLocale = (locale) => {
    setRightLocale(locale)
    fetchByLocales(campaignId, selectedId, [leftLocale, locale])
  }

  const selectedTemplate = _.find(list, ({ id }) => id === parseInt(selectedId, 10))
  const selectedLeftLocale = _.find(listWithLocales, (
    { id, locale },
  ) => id === parseInt(selectedId, 10) && locale === leftLocale) || {}
  const selectedRightLocale = _.find(listWithLocales, (
    { id, locale },
  ) => id === parseInt(selectedId, 10) && locale === rightLocale) || {}

  if (_.isUndefined(selectedTemplate)) { return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }

  const saveTemplate = () => {
    save(campaignId, { ...selectedTemplate, ...selectedLeftLocale }, leftLocale)
      .then(() => {
        setErrors(null)
        message.success('Template saved successfully', 5)
      })
      .catch(setErrors)
  }

  return (
    <Row className={styles.container}>
      <Col xs={8} lg={7} xl={5}>
        <TemplateMenu emailTemplates={list} selectedId={selectedTemplate.id} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar emailTemplate={selectedTemplate} openModal={openModal} />
        <div className={styles.content}>
          <ErrorAlertBox errors={errors} scrollToError className="mtl mbl" />
          <ConsolidatedSwitch selectedTemplate={selectedTemplate} update={update} />
          <DailyDigest selectedTemplate={selectedTemplate} update={update} />
          <Input
            addonBefore={I18n.t('admin.from')}
            value={selectedTemplate.from}
            className={cs(['mbm', styles.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'from', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('admin.reply_to_email')}
            value={selectedTemplate.replyToEmail}
            className={cs(['mbm', styles.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'replyToEmail', e.target.value) }}
          />
          <div className="display-flex justify-content-space-between">
            <Select defaultValue="en" className="mb8 width150px" onChange={updateLeftLocale}>
              {availableLocales.map(locale => (
                <Option key={locale} value={locale}>
                  {I18n.t(`languages.${locale}`)}
                </Option>
              ))}
            </Select>
            <div>
              <span className="mr8">{I18n.t('common.text.reference_language')}</span>
              <Select className="mb8 width150px" placeholder={I18n.t('select')} onChange={updateRightLocale}>
                <Option value={null}>
                  {I18n.t('empty')}
                </Option>
                {emailTemplates.availableLocales.map(locale => (
                  <Option key={locale} value={locale}>
                    {I18n.t(`languages.${locale}`)}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="display-flex">
            <Input
              addonBefore={I18n.t('admin.subject')}
              value={selectedLeftLocale.subject}
              className="mb8"
              onChange={(e) => { update(selectedTemplate.id, 'subject', e.target.value, leftLocale) }}
            />
            {rightLocale && (
              <Input
                addonBefore={I18n.t('admin.subject')}
                value={selectedRightLocale.subject}
                readOnly
                className="mb8"
              />
            )}
          </div>
          <div className="display-flex">
            <EmailEditor
              withPipedText
              className="flex1"
              type={selectedTemplate.name}
              content={selectedLeftLocale.content || ''}
              details={{ consolidation: selectedTemplate.consolidated }}
              handleContentChange={(value) => { update(selectedTemplate.id, 'content', value, leftLocale) }}
            />
            {rightLocale && (
              <div className={styles.comparisonBody}>
                <SafeHTML html={selectedRightLocale.content} className="m16" />
              </div>
            )}
          </div>
        </div>

        <FooterBar emailTemplate={selectedTemplate} />

        <Button
          type="primary"
          size="large"
          className="mtm mll"
          onClick={saveTemplate}
        >
          <SaveOutlined />
          {I18n.t('shared.save')}
        </Button>
      </Col>
      <SentTestEmailModal />
      <EmailScheduleModal />
    </Row>
  )
}

function ConsolidatedSwitch ({ selectedTemplate, update }) {
  if (!_.includes(CONSOLIDATED_EMAIL_NAMES, selectedTemplate.name)) {
    return null
  }

  return (
    <div className="mbm">
      <Switch
        checked={selectedTemplate.consolidated}
        onChange={(checked) => { update(selectedTemplate.id, 'consolidated', checked) }}
      />
      {'  '}
      <span>{I18n.t('admin.consolidated')}</span>
    </div>
  )
}

function DailyDigest ({ selectedTemplate, update }) {
  if (!_.includes(DAILY_DIGEST_EMAILS, selectedTemplate.name)) {
    return null
  }

  return (
    <>
      <div className="mbm">
        <Switch
          checked={selectedTemplate.dailyDigest}
          onChange={(checked) => { update(selectedTemplate.id, 'dailyDigest', checked) }}
        />
        {'  '}
        <span>Daily Digest</span>
      </div>
      {selectedTemplate.dailyDigest && (
        <div className="mbm">
          <TimePicker
            value={dayjs(selectedTemplate.scheduleTime || Date.now())}
            format="HH:mm"
            className={cs(['mbm', styles.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'scheduleTime', e.toString()) }}
          />
        </div>
      )}
    </>
  )
}
