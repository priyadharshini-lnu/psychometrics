import React, { useState, useEffect } from 'react'
import {
  Row, Col, Form, Button, Select, App,
} from 'antd'
import humps from 'humps'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import {
  ProfileField,
  ProfileSettings as ProfileSettingsType,
  QuestionField as QuestionFieldType,
} from '~/modules/admin/modules/client/core/profileSettings'
import { DefaultFields } from './DefaultFields'
import { Fields } from './Fields'
import styles from './Profile.less'

const { I18n } = window
interface Meta extends BaseMeta {
  fieldQuestions: QuestionFieldType[]
}

export const Profile: React.FC<{}> = () => {
  const { projectId } = useParams() as { projectId: string }
  const {
    data, updateResource, fetch, isLoading, meta, setData,
  } = useResources<ProfileSettingsType, Meta>('profile_settings')
  const [form] = Form.useForm()
  const [profileSettings] = data
  const [values, setValues] = useState({})
  const { message } = App.useApp()

  useEffect(() => {
    if (profileSettings) {
      form.setFieldsValue(profileSettings)
    }
  }, [profileSettings])
  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { project_id_eq: projectId },
      },
    })
  }, [])

  const updateProfileFields = (data: ProfileField[]) => {
    setData([{
      ...profileSettings,
      profileFields: data,
    }])
  }

  const updateRequiredSettings = (data) => {
    setData([{
      ...profileSettings,
      requiredDefaultFields: data,
    }])
  }

  const updateLockedSettings = (data) => {
    setData([{
      ...profileSettings,
      lockedDefaultFields: data,
    }])
  }

  const updateEnabledSettings = (data) => {
    setData([{
      ...profileSettings,
      enabledDefaultFields: data,
    }])
  }

  const updateMultipleSettings = (data) => {
    setData([{
      ...profileSettings,
      ...data,
    }])
  }

  const onFinish = (values) => {
    updateResource({
      id: profileSettings.id,
      ...values,
      profileFields: profileSettings.profileFields,
      requiredDefaultFields: profileSettings.requiredDefaultFields,
      lockedDefaultFields: profileSettings.lockedDefaultFields,
      enabledDefaultFields: profileSettings.enabledDefaultFields,
    }).then(() => {
      message.success(I18n.t('profile.success_update'))
    })
  }

  const addField = (q) => {
    setData([{
      ...profileSettings,
      profileFields: [...profileSettings.profileFields, {
        id: null,
        questionId: q.id,
        name: q.name,
        required: false,
        halfSize: false,
        position: profileSettings.profileFields.length + 1,
        locked: false,
      }],
    }])
  }

  const removeField = (row) => {
    setData([{
      ...profileSettings,
      profileFields: profileSettings.profileFields
        .map(field => (field.name === row.name ? { ...field, _remove: true } : field))
        .map((d, i) => ({ ...d, position: i + 1 })),
    }])
  }
  const isSaving = isLoading(`update@${data[0]?.id}`)

  if (!profileSettings) { return null }

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <Form
          name="profile"
          onValuesChange={value => setValues({ ...values, ...value })}
          layout="horizontal"
          labelAlign="left"
          form={form}
          labelCol={{
            sm: 24,
            md: 10,
            lg: 8,
            xl: 8,
          }}
          onFinish={onFinish}
          initialValues={profileSettings}
        >
          <Form.Item name="updateIn" label={I18n.t('admin.projects_profile_settings_update_in')}>
            <Select
              onChange={(value:string) => (setData([{ ...profileSettings, updateIn: value }]))}
              options={[
                {
                  value: null,
                  label: I18n.t('admin.projects_profile_settings_never'),
                },
                {
                  value: '1',
                  label: I18n.t('admin.projects_profile_settings_month', { count: 1 }),
                },
                {
                  value: '3',
                  label: I18n.t('admin.projects_profile_settings_month', { count: 3 }),
                },
                {
                  value: '6',
                  label: I18n.t('admin.projects_profile_settings_month', { count: 6 }),
                },
                {
                  value: '12',
                  label: `1 ${I18n.t('admin.projects_profile_settings_year')}`,
                },
              ]}
            />
          </Form.Item>
          <DefaultFields
            requiredFields={humps.decamelizeKeys(profileSettings.requiredDefaultFields)}
            lockedFields={humps.decamelizeKeys(profileSettings.lockedDefaultFields)}
            enabledFields={humps.decamelizeKeys(profileSettings.enabledDefaultFields)}
            onChangeRequired={updateRequiredSettings}
            onChangeLocked={updateLockedSettings}
            onChangeEnabled={updateEnabledSettings}
            onChangeMultiple={updateMultipleSettings}
          />
          <Fields
            profileFields={profileSettings.profileFields}
            questions={meta.fieldQuestions}
            onAddField={addField}
            onRemoveField={removeField}
            onChange={data => updateProfileFields(data)}
            onSort={data => updateProfileFields(data)}
          />
          <Row className={styles.footer}>
            <Button type="primary" htmlType="submit" className="mb-16" loading={isSaving}>
              {I18n.t('shared.save')}
            </Button>
          </Row>
        </Form>
      </Col>
    </Row>
  )
}
