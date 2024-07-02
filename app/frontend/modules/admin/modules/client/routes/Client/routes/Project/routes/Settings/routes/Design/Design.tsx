import React, { useState, useEffect } from 'react'
import {
  Row, Col, Form, Radio, Button, Upload, ConfigProvider, App,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { UploadOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { UploadFile } from 'antd/lib/upload/interface'
import type { Theme } from 'antd/lib/config-provider/context'
import {
  Files, DesignSettings as DesignSettingsType,
  uploadFiles,
} from '~/modules/admin/modules/client/core/designSettings'
import { useResources } from '~/hooks/useResources/useResources'
import { ColorPicker } from '~/glint'
import { DesignPreview } from './DesignPreview'
import styles from './styles.less'

const { I18n } = window

const connecter = connect(() => ({}), { uploadFiles })

type Props = ConnectedProps<typeof connecter>

export const DesignComponent: React.FC<Props> = ({ uploadFiles }) => {
  const { projectId } = useParams() as { projectId: string }
  const [isLoading, setIsLoading] = useState(false)
  const {
    data, updateResource, fetch,
  } = useResources<DesignSettingsType>('design_settings')
  const [form] = Form.useForm()
  const [designSettings] = data
  const [values, setValues] = useState({})
  const { message } = App.useApp()
  useEffect(() => {
    if (designSettings) {
      form.setFieldsValue(designSettings)
      setIsLoading(false)
    }
  }, [designSettings])

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { project_id_eq: projectId },
      },
    })
    return () => ConfigProvider.config({
      theme: {},
    })
  }, [])

  const onFinish = () => {
    const values = form.getFieldsValue()
    setIsLoading(true)

    const update = () => {
      const jsonData = _.pick(values, [
        'backgroundColor',
        'backgroundSize',
        'loginBoxPosition',
        'primaryColor',
        'errorColor',
        'warningColor',
        'successColor',
        'infoColor',
      ])
      updateResource({ id: designSettings.id, ...jsonData } as DesignSettingsType).then(() => {
        message.success(I18n.t('administration.projects.design_settings.success_update'))
      })
    }
    const files: Files = {
      ..._.pick(values, ['logo', 'background']),
      secondary_logo: values.secondaryLogo,
    }

    if (_.some(files, f => f && !!f.file)) {
      const formData = new FormData()
      _.each(files, (img, name) => {
        if (img?.file) {
          (img.file as UploadFile).status === 'removed'
            ? formData.append(`purge_${name}`, '1')
            : formData.append(name, img.file as File, img.file.name)
        }
      })
      uploadFiles(designSettings.id, formData).finally(update)
    } else {
      update()
    }
  }

  const removeFile = (file: UploadFile) => {
    form.setFieldsValue({ [file.name]: null })
  }

  const resetColor = (field) => {
    form.setFieldsValue({ [field]: null })
  }

  const logo = Form.useWatch('logo', form)
  const background = Form.useWatch('background', form)
  const secondaryLogo = Form.useWatch('secondaryLogo', form)

  const colors = _.pick(designSettings,
    ['primaryColor', 'errorColor', 'warningColor', 'successColor', 'infoColor']) as Theme

  return (
    <Row justify="space-between" className="pl" gutter={16}>
      <Col sm={24} md={16} xl={12} xxl={10}>
        <Form
          name="design"
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
          initialValues={designSettings}
        >
          <Form.Item name="logo" label={I18n.t('administration.projects.design_settings.client_logo_label')}>
            <Upload
              listType="picture"
              maxCount={1}
              onRemove={removeFile}
              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
              fileList={logo && typeof logo === 'string' ? [{
                uid: '1', name: 'logo', status: 'done', url: logo,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>{I18n.t('administration.projects.design_settings.logo_upload')}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="background" label={I18n.t('administration.projects.design_settings.background_label')}>
            <Upload
              listType="picture"
              maxCount={1}
              // eslint-disable-next-line max-len
              accept=".jpeg, .jpg, .png, .svg, .mp4, .gif, .bmp, image/jpeg, image/png, image/svg+xml, video/mp4, image/gif"
              fileList={background && typeof background === 'string' ? [{
                uid: '1', name: 'background', status: 'done', url: background,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('administration.projects.design_settings.bg_upload')}
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item name="backgroundSize" label={I18n.t('administration.projects.design_settings.background_size')}>
            <Radio.Group>
              <Radio value="cover">{I18n.t('administration.projects.design_settings.background_size_cover')}</Radio>
              <Radio value="contain">{I18n.t('administration.projects.design_settings.background_size_contain')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="secondaryLogo" label={I18n.t('administration.projects.design_settings.sec_logo_label')}>
            <Upload
              listType="picture"
              maxCount={1}
              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
              fileList={secondaryLogo && typeof secondaryLogo === 'string' ? [{
                uid: '1', name: 'secondary_logo', status: 'done', url: secondaryLogo,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('administration.projects.design_settings.sec_logo_upload')}
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item label={I18n.t('administration.projects.design_settings.background_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="backgroundColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#ffffff" />
              </Form.Item>
              <Button onClick={() => resetColor('backgroundColor')}>
                {I18n.t('administration.projects.design_settings.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('administration.projects.design_settings.primary_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="primaryColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#009ea7" />
              </Form.Item>
              <Button onClick={() => resetColor('primaryColor')}>
                {I18n.t('administration.projects.design_settings.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('administration.projects.design_settings.error_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="errorColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#f5222d" />
              </Form.Item>
              <Button onClick={() => resetColor('errorColor')}>
                {I18n.t('administration.projects.design_settings.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('administration.projects.design_settings.warning_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="warningColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#faad14" />
              </Form.Item>
              <Button onClick={() => resetColor('warningColor')}>
                {I18n.t('administration.projects.design_settings.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('administration.projects.design_settings.success_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="successColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#52c41a" />
              </Form.Item>
              <Button onClick={() => resetColor('successColor')}>
                {I18n.t('administration.projects.design_settings.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('administration.projects.design_settings.info_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="infoColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#009ea7" />
              </Form.Item>
              <Button onClick={() => resetColor('infoColor')}>
                {I18n.t('administration.projects.design_settings.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item name="loginBoxPosition" label={I18n.t('administration.projects.design_settings.position_label')}>
            <Radio.Group>
              <Radio value="left">{I18n.t('administration.projects.design_settings.position_left')}</Radio>
              <Radio value="auto">{I18n.t('administration.projects.design_settings.position_auto')}</Radio>
              <Radio value="right">{I18n.t('administration.projects.design_settings.position_right')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" onClick={onFinish} className="mb-16" loading={isLoading}>
            {I18n.t('administration.save')}
          </Button>
        </Form>
      </Col>
      <Col sm={24} md={16} xl={12} xxl={14}>
        <DesignPreview config={{ ...colors, ...values }} />
      </Col>
    </Row>
  )
}

export const Design = connecter(DesignComponent)
