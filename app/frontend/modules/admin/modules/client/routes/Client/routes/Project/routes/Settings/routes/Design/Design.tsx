import React, { useState, useEffect, useMemo } from 'react'
import {
  Row, Col, Form, Radio, Button, Upload, ConfigProvider, App, Input,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { generate } from '@ant-design/colors'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { UploadFile } from 'antd/es/upload/interface'
import type { Theme } from 'antd/es/config-provider/context'
import { UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  Files, DesignSettings as DesignSettingsType,
  uploadFiles,
} from '~/modules/admin/modules/client/core/designSettings'
import { useResources } from '~/hooks/useResources/useResources'
import { ColorPicker } from '~/glint'
import { DesignPreview } from './DesignPreview'
import { getContrastRatio } from '~/utils/contrastRatio'
import { getProject as getCurrentProject } from '~/modules/admin/core/ui/breadcrumbs'

import styles from './styles.less'

const { I18n } = window
const DEFAULT_PRIMARY_COLOR = '#04717B'
const DEFAULT_ERROR_COLOR = '#ff4d4f'
const MAX_ALT_TEXT_LENGTH = 100

const connecter = connect(
  (state: RootState) => ({
    projectName: getCurrentProject(state).name,
  }),
  {
    uploadFiles,
  },
)

type Props = ConnectedProps<typeof connecter>

export const DesignComponent: React.FC<Props> = ({ uploadFiles, projectName }) => {
  const { projectId } = useParams() as { projectId: string }
  const [isLoading, setIsLoading] = useState(false)
  const {
    data, updateResource, fetch,
  } = useResources<DesignSettingsType>('design_settings')
  const [form] = Form.useForm()
  const [designSettings] = data
  const [values, setValues] = useState({})
  const { message } = App.useApp()
  const logo = Form.useWatch('logo', form)
  const background = Form.useWatch('background', form)
  const backgroundOverlay = Form.useWatch('backgroundOverlay', form)
  const secondaryLogo = Form.useWatch('secondaryLogo', form)

  interface UploadFormErrorValues {
    logo?: string[]
    background?: string[]
    secondaryLogo?: string[]
    backgroundOverlay?: string[]
  }

  const [uploadFormErrors, setUploadFormErrors] = useState<UploadFormErrorValues>({})

  const colors = _.pick(designSettings,
    ['primaryColor', 'errorColor', 'warningColor', 'successColor', 'infoColor']) as Theme

  const primaryColor = Form.useWatch('primaryColor', form) || colors.primaryColor || DEFAULT_PRIMARY_COLOR
  const errorColor = Form.useWatch('errorColor', form) || colors.errorColor || DEFAULT_ERROR_COLOR

  useEffect(() => {
    if (designSettings) {
      const initialFormValues = {
        ...designSettings,
        logoAltText: designSettings.logoAltText || projectName,
        secondaryLogoAltText: designSettings.secondaryLogoAltText || projectName,
      }

      form.setFieldsValue(initialFormValues)
      setIsLoading(false)
    }
  }, [designSettings, projectName])

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

  const primaryColorHasEnoughContrast = useMemo(() => {
    if (primaryColor) {
      const colorPalette = generate(primaryColor)
      const primaryColorCodeWithoutHash = primaryColor.slice(1)
      const hasEnoughContrastRatioWhiteFont = getContrastRatio(primaryColorCodeWithoutHash, 'FFFFFF').isAccessible
      const hasEnoughContrastRatioBgTheme = getContrastRatio(
        primaryColorCodeWithoutHash, colorPalette[0].slice(1),
      ).isAccessible
      return (hasEnoughContrastRatioWhiteFont && hasEnoughContrastRatioBgTheme)
    }
    return true
  }, [primaryColor])

  const errorColorHasEnoughContrast = useMemo(() => {
    if (errorColor) {
      const errorColorCodeWithoutHash = errorColor.slice(1)
      const hasEnoughContrastRatioWhiteBackground = getContrastRatio(errorColorCodeWithoutHash, 'FFFFFF').isAccessible
      return (hasEnoughContrastRatioWhiteBackground)
    }
    return true
  }, [errorColor])

  const onFinish = () => {
    form
      .validateFields()
      .then(() => {
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
            'logoAltText',
            'secondaryLogoAltText',
          ])
          updateResource({ id: designSettings.id, ...jsonData } as DesignSettingsType).then(() => {
            message.success(
              I18n.t('admin.success_update'),
            )
            setIsLoading(false)
          })
        }

        const files: Files = {
          ..._.pick(values, ['logo', 'background']),
          secondary_logo: values.secondaryLogo,
          background_overlay: values.backgroundOverlay,
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
          uploadFiles(designSettings.id, formData)
            .then(() => {
              _.isEmpty(uploadFormErrors) && update()
            })
            .catch((errors) => {
              setUploadFormErrors(errors)
              setIsLoading(false)
            })
        } else {
          update()
        }
      })
      .catch((errorInfo) => {
        message.error(`${errorInfo.message}`)
      })
  }

  const removeFile = (file: UploadFile, fieldName) => {
    form.setFieldsValue({ [file.name]: null })
    setUploadFormErrors(prevErrors => _.omit(prevErrors, fieldName))
  }

  const resetColor = (field) => {
    form.setFieldsValue({ [field]: null })
  }

  const validateAltText = (fieldName: string, value: string): Promise<void> => {
    if (!value || value.trim() === '') {
      return Promise.reject(
        new Error(I18n.t(`admin.${fieldName}_required`)),
      )
    }
    const validPattern = /^[a-zA-Z0-9\s.,'-]+$/
    if (!validPattern.test(value.trim())) {
      return Promise.reject(
        new Error(I18n.t('admin.alt_text_invalid')),
      )
    }
    return Promise.resolve()
  }

  const getFieldRules = (fieldName: string) => [
    {
      validator: (_: unknown, value: string) => validateAltText(fieldName, value),
    },
    {
      max: MAX_ALT_TEXT_LENGTH,
      message: I18n.t('admin.alt_text_long'),
    },
  ]

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
          <Form.Item
            name="logo"
            label={I18n.t('admin.client_logo_label')}
            validateStatus={uploadFormErrors.logo ? 'error' : 'success'}
            help={uploadFormErrors.logo?.[0] ?? ''}
          >
            <Upload
              listType="picture"
              maxCount={1}
              onRemove={file => removeFile(file, 'logo')}
              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
              fileList={logo && typeof logo === 'string' ? [{
                uid: '1', name: 'logo', status: 'done', url: logo,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>{I18n.t('shared.upload')}</Button>
            </Upload>
          </Form.Item>
          {logo && (
            <Form.Item
              name="logoAltText"
              label={I18n.t('admin.alt_text_logo')}
              rules={getFieldRules('alt_text_logo')}
            >
              <Input maxLength={MAX_ALT_TEXT_LENGTH} />
            </Form.Item>
          )}
          <Form.Item
            name="background"
            label={I18n.t('admin.background_label')}
            validateStatus={uploadFormErrors.background ? 'error' : 'success'}
            help={uploadFormErrors.background?.[0] ?? ''}
          >
            <Upload
              listType="picture"
              maxCount={1}
              onRemove={file => removeFile(file, 'background')}
              accept=".jpeg, .jpg, .png, .svg, .gif, image/jpeg, image/png, image/svg+xml, image/gif"
              fileList={background && typeof background === 'string' ? [{
                uid: '1', name: 'background', status: 'done', url: background,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('shared.upload')}
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item name="backgroundSize" label={I18n.t('admin.background_size')}>
            <Radio.Group>
              <Radio value="cover">{I18n.t('admin.background_size_cover')}</Radio>
              <Radio value="contain">{I18n.t('admin.background_size_contain')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="backgroundOverlay"
            label={I18n.t('admin.background_overlay_label')}
            validateStatus={uploadFormErrors.backgroundOverlay ? 'error' : 'success'}
            help={uploadFormErrors.backgroundOverlay?.[0] ?? ''}
          >
            <Upload
              listType="picture"
              maxCount={1}
              onRemove={file => removeFile(file, 'backgroundOverlay')}
              accept=".jpeg, .jpg, .png, .svg, .mp4, .gif, image/jpeg, image/png, image/svg+xml, image/gif"
              fileList={backgroundOverlay && typeof backgroundOverlay === 'string' ? [{
                uid: '1', name: 'background_overlay', status: 'done', url: backgroundOverlay,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('shared.upload')}
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="secondaryLogo"
            label={I18n.t('admin.sec_logo_label')}
            validateStatus={uploadFormErrors.secondaryLogo ? 'error' : 'success'}
            help={uploadFormErrors.secondaryLogo?.[0] ?? ''}
          >
            <Upload
              listType="picture"
              maxCount={1}
              onRemove={file => removeFile(file, 'secondaryLogo')}
              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
              fileList={secondaryLogo && typeof secondaryLogo === 'string' ? [{
                uid: '1', name: 'secondary_logo', status: 'done', url: secondaryLogo,
              }] : undefined}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('shared.upload')}
              </Button>
            </Upload>
          </Form.Item>
          {secondaryLogo && (
            <Form.Item
              name="secondaryLogoAltText"
              label={I18n.t('admin.secondary_logo_alt_text')}
              rules={getFieldRules('secondary_logo_alt_text')}
            >
              <Input maxLength={MAX_ALT_TEXT_LENGTH} />
            </Form.Item>
          )}
          <Form.Item label={I18n.t('admin.background_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="backgroundColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#ffffff" />
              </Form.Item>
              <Button onClick={() => resetColor('backgroundColor')}>
                {I18n.t('shared.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item
            label={I18n.t('admin.primary_color')}
          >
            <div className={styles.colorPicker}>
              <Form.Item
                help={primaryColorHasEnoughContrast ? ''
                  : I18n.t('admin.contrast_ratio_warning')}
                hasFeedback={!primaryColorHasEnoughContrast}
                validateStatus="error"
                name="primaryColor"
              >
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor={DEFAULT_PRIMARY_COLOR} />
              </Form.Item>
              <Button className={styles.colorReset} onClick={() => resetColor('primaryColor')}>
                {I18n.t('shared.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('admin.error_color')}>
            <div className={styles.colorPicker}>
              <Form.Item
                name="errorColor"
                help={errorColorHasEnoughContrast ? ''
                  : I18n.t('admin.contrast_ratio_warning_lighter_color',
                    { name: 'error' })}
                hasFeedback={!errorColorHasEnoughContrast}
                validateStatus="error"
              >
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#f5222d" />
              </Form.Item>
              <Button className={styles.colorReset} onClick={() => resetColor('errorColor')}>
                {I18n.t('shared.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('admin.warning_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="warningColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#faad14" />
              </Form.Item>
              <Button onClick={() => resetColor('warningColor')}>
                {I18n.t('shared.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('admin.success_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="successColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor="#52c41a" />
              </Form.Item>
              <Button onClick={() => resetColor('successColor')}>
                {I18n.t('shared.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={I18n.t('admin.info_color')}>
            <div className={styles.colorPicker}>
              <Form.Item name="infoColor">
                <ColorPicker getValueInHexFormat swatchClassName={styles.swatch} defaultColor={DEFAULT_PRIMARY_COLOR} />
              </Form.Item>
              <Button onClick={() => resetColor('infoColor')}>
                {I18n.t('shared.reset')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item name="loginBoxPosition" label={I18n.t('admin.position_label')}>
            <Radio.Group>
              <Radio value="left">{I18n.t('admin.position_left')}</Radio>
              <Radio value="auto">{I18n.t('admin.position_auto')}</Radio>
              <Radio value="right">{I18n.t('admin.position_right')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" onClick={onFinish} className="mb-16" loading={isLoading}>
            {I18n.t('shared.save')}
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
