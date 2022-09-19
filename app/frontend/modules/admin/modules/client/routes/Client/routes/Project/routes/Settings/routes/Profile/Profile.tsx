import React, { useState, useEffect } from 'react'
import {
  Row, Col, Form, Button, Select, message,
} from 'antd'
import { useResources } from 'hooks/useResources/useResources'
import { BaseMeta } from 'hooks/useResources/interfaces'
import { useParams } from 'react-router-dom'
import {
  ProfileField,
  ProfileSettings as ProfileSettingsType,
  QuestionField as QuestionFieldType,
} from 'modules/admin/modules/client/core/profileSettings'
import { Fields } from './Fields'
import styles from './Profile.less'

const { I18n } = window
interface Meta extends BaseMeta {
  fieldQuestions: QuestionFieldType[]
}

export const Profile: React.FC<{}> = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    data, updateResource, fetch, isLoading, meta, setData,
  } = useResources<ProfileSettingsType, Meta>('profile_settings')
  const [form] = Form.useForm()
  const [profileSettings] = data
  const [values, setValues] = useState({})

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

  const onFinish = (values) => {
    updateResource({ id: profileSettings.id, ...values, profileFields: profileSettings.profileFields }).then(() => {
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
  const isSaving = isLoading('update')

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
          <Form.Item name="update_in" label={I18n.t('administration.projects.profile_settings.update_in')}>
            <Select>
              <Select.Option>
                {I18n.t('administration.projects.profile_settings.never')}
              </Select.Option>
              <Select.Option value="1">
                {I18n.t('administration.projects.profile_settings.month', { count: 1 })}
              </Select.Option>
              <Select.Option value="3">
                {I18n.t('administration.projects.profile_settings.month', { count: 3 })}
              </Select.Option>
              <Select.Option value="6">
                {I18n.t('administration.projects.profile_settings.month', { count: 6 })}
              </Select.Option>
              <Select.Option value="12">
                1
                {I18n.t('administration.projects.profile_settings.year')}
              </Select.Option>
            </Select>
          </Form.Item>
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
              {I18n.t('administration.save')}
            </Button>
          </Row>
        </Form>
      </Col>
    </Row>
  )
}
