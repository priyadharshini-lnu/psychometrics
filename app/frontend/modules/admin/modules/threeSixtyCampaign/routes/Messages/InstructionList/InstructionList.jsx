import { useEffect, useState } from 'react'
import {
  Row, Col, Button, Empty, App, Select,
} from 'antd'
import _ from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'
import { SaveOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Editor from '~/components/Editor'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import { SafeHTML } from '~/components/SafeHTML'
import routeUtils from '~/utils/route'
import TitleBar from './TitleBar'
import settings from '../../../settings'
import styles from './styles.less'
import TemplateMenu from './TemplateMenu'

const { Option } = Select

export default function InstructionList ({
  availableLocales,
  instructionTemplates,
  instructionTemplates: { list, listWithLocales },
  fetch,
  fetchByLocales,
  update,
  save,
}) {
  const { message } = App.useApp()
  const { campaignId, id: selectedId } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    fetch(campaignId)
      .then(({ response }) => {
        if (!selectedId) {
          routeUtils.moveTo(navigate, settings.urlPrefix, `/messages/instructions/${response[0].id}`)
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
  if (!selectedTemplate) { return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }

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
        <TemplateMenu history={history} instructionTemplates={list} selectedId={selectedId} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar
          instructionTemplate={selectedTemplate}
          toggleEnabled={() => { update(selectedTemplate.id, 'enabled', !selectedTemplate.enabled) }}
        />
        <div className={styles.content}>
          <div className="display-flex justify-content-space-between mt8">
            <Select defaultValue="en" className="mb8 width150px" onChange={updateLeftLocale}>
              {availableLocales.map(locale => (
                <Option key={locale} value={locale}>
                  {I18n.t(`languages.${locale}`)}
                </Option>
              ))}
            </Select>
            <div>
              <span className="mr8">{I18n.t('common.text.reference_language')}</span>
              <Select className="mb8 width150px" placeholder={I18n.t('select')} onChange={updateRightLocale} allowClear>
                {instructionTemplates.availableLocales.map(locale => (
                  <Option key={locale} value={locale}>
                    {I18n.t(`languages.${locale}`)}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <ErrorAlertBox errors={errors} className="mtl mbl" />
          <div className="display-flex">
            <Editor
              className="flex1"
              type={selectedTemplate.name}
              content={selectedLeftLocale.content || ''}
              handleContentChange={(value) => { update(selectedTemplate.id, 'content', value, leftLocale) }}
              withPipedText
            />
            {rightLocale && (
              <div className={styles.comparisonBody}>
                <SafeHTML html={selectedRightLocale.content} className="m16" config="adminRichText" />
              </div>
            )}
          </div>
        </div>

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
    </Row>
  )
}
