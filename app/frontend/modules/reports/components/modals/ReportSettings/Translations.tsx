import { connect } from 'react-redux'
import {
  Button, Space, Typography, Divider,
  Card, Form, message,
} from 'antd'
import { useRef, useState } from 'react'
import { RootState } from '~/modules/reports/core/rootReducers'
import I18nStore from '~/modules/reports/store/I18nStore'
import { importTranslations } from '~/modules/reports/core/builder/actions'

const { I18n, $ } = window

const TranslationsComponent = ({ report, importTranslations }) => {
  const form = useRef<HTMLFormElement>(null)
  const data = useRef<HTMLInputElement>(null)
  const file = useRef<HTMLInputElement>(null)

  const [errors, setErrors] = useState<string[]>()

  const onExport = () => {
    if (form.current && data.current) {
      data.current.value = JSON.stringify(I18nStore.exportReport())
      form.current.submit()
    }
  }

  const onImport = () => {
    if (file.current?.files?.length) {
      setErrors(undefined)
      const formdata = new FormData(form[0])
      formdata.append('file', file.current.files[0])
      importTranslations(report.id, formdata)
        .then(() => {
          message.config({
            getContainer: () => document.getElementById('fixed_header') || document.body,
          })
          message.success({
            content: I18n.t('administration.translations.import.successfully'),
            style: { zIndex: 9999 },
          })
          if (file.current) {
            file.current.value = ''
          }
        })
        .catch((response) => {
          if (response) {
            setErrors(response.file.join(' '))
          } else {
            setErrors(I18n.t('errors.error_500'))
          }
        })
    } else {
      setErrors(I18n.t('validations.blank'))
    }
  }

  return (
    <div>
      <Button type="primary" onClick={onExport}>{I18n.t('administration.translations.reports.export')}</Button>

      <form
        style={{ display: 'none' }}
        ref={form}
        action={`/administration/translations/reports/${report.id}/export`}
        method="POST"
      >
        <input name="authenticity_token" type="hidden" value={$('meta[name=csrf-token]').attr('content')} />
        <input ref={data} name="data" />
      </form>
      <Divider />
      <Typography.Title level={5}>
        {I18n.t('administration.translations.reports.import')}
        :
      </Typography.Title>

      <Card>
        <Space direction="vertical">
          <div>
            {I18n.t('administration.translations.reports.import_descr')}
          </div>
          <Form.Item validateStatus={errors ? 'error' : undefined} help={errors}>
            <input ref={file} type="file" />
          </Form.Item>
          <Button type="primary" onClick={onImport}>{I18n.t('administration.import')}</Button>
        </Space>
      </Card>
    </div>
  )
}

export const Translations = connect(
  ({ report: { builder } }: RootState) => ({
    report: builder,
  }),
  {
    importTranslations,
  },
)(TranslationsComponent)
