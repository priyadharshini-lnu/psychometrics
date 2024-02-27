import { useState } from 'react'
import { connect } from 'react-redux'
import {
  Col, Row, Typography, Form, Upload, Input, Select, App, Layout, InputNumber, Space, Progress, Button,
} from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import cs from 'classnames'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CropImageModal } from '~/glint/components/CropImageModal'
import Utils from '~/modules/reports/utils/Utils'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import {
  sync,
  get as getUser,
  uploadPhoto,
} from '~/core/currentUser'
import { DirectionalArrowIcon, PageHeader } from '~/glint'
import array from '~/utils/array'
import { CustomField } from './fields/CustomField'

import styles from './styles.less'

const { Text, Title } = Typography
const { I18n } = window
const locales = I18n.availableLocales
const { Content } = Layout

const timeZones = Intl.supportedValuesOf('timeZone')

interface Image {
  type?: string
  src: string
}
interface Errors {
  password?: []
  passwordConfirmation?: []
  age?: []
  first_name?: []
  last_name?: []
  locale?: []
  timezone?: []
  photo?: []
}

const AVAILABLE_QUESTIONS = {
  MultipleChoice: ['SingleAnswer', 'MultipleAnswer', 'Dropdown'],
  TextEntry: ['SingleLine', 'Multiline'],
}

const isAvailable = ({ question }) => AVAILABLE_QUESTIONS[question.type]
  && AVAILABLE_QUESTIONS[question.type].includes(question.props.type)

function ProfileComponent ({
  user, uploadPhoto, sync, fields, lockedFields, requiredFields,
}) {
  const [showCropper, setShowCropper] = useState(false)
  const [image, setImage] = useState<Image | null>(null)
  const [errors, setErrors] = useState <Errors>({})
  const { message } = App.useApp()

  const uploadFile = (canvas) => {
    if (canvas) {
      const form = new FormData()
      canvas.toBlob((blob) => {
        if (blob) {
          form.append('photo', blob, 'file.jpg')
          uploadPhoto(form).then(() => {
            setShowCropper(false)
          })
        }
      }, 'image/jpg')
    }
  }

  const customFields = _.reduce(user.customFields, (res, field, id) => ({ ...res, [`field_${id}`]: field }), {})

  const submitForm = (values) => {
    const data = _.reduce({ ...values, photo: user.photo }, (res, val, key) => {
      const data = key.match(/field_(\d+)/)
      if (data) {
        return { ...res, customFields: { ...res.customFields, [data[1]]: val ?? customFields[key] } }
      }
      return { ...res, [key]: val }
    }, { customFields: {} })

    sync(data)
      .then(({ response }) => {
        message.success(I18n.t('profile.success_update'), 5)
        if (response.backUrl) {
          location.href = response.backUrl
        }
        setErrors({})
      }).catch((errors) => {
        setErrors(errors)
      })
  }

  const onChangeFile = ({ file }) => {
    const blob = URL.createObjectURL(file)

    setImage({
      src: blob,
      type: file.type,
    })
    setShowCropper(true)
  }

  const timezoneNames = timeZones.map(zone => ({ zone, label: `(GMT${dayjs().tz(zone).format('Z')}) ${zone}` }))
    .sort((a, b) => Number(dayjs().tz(a.zone).format('ZZ')) - Number(dayjs().tz(b.zone).format('ZZ')))
  const timezoneGuess = dayjs.tz.guess()

  if (timezoneGuess) {
    timezoneNames.unshift({
      zone: timezoneGuess,
      label: `(GMT${dayjs().tz(timezoneGuess).format('Z')}) ${timezoneGuess}`,
    })
  }
  const headerElement = (
    <Col flex="auto" span={24} className="ta-e">
      <LangDropdownWithChangeLocale />
    </Col>
  )

  return (
    <>
      <PageHeader>{headerElement}</PageHeader>
      <Content className={styles.pageContent}>
        <div className={styles.container}>
          {user.updateProfileRequired && (
            <Row>
              <Col span={18}>
                <Title level={5}>{I18n.t('profile.update_required')}</Title>
                <Space size="middle" direction="vertical">
                  <Text>{user.updateProfileMessage}</Text>
                </Space>
              </Col>
              <Col span={6} className={styles.progressCol}>
                <Progress percent={user.profileCompletionPercentage} type="circle" />
              </Col>
            </Row>
          )}
          <Row gutter={[32, 32]}>
            <Col span={24}>
              <Title level={3}>{I18n.t('profile.title')}</Title>
              <Row gutter={64}>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    help={errors?.photo}
                    validateStatus={errors?.photo ? 'error' : ''}
                    required={requiredFields.photo}
                  >
                    <Upload
                      listType="picture-card"
                      accept=".jpg, .jpeg, |image/*"
                      showUploadList={false}
                      maxCount={1}
                      className={cs(styles.upload, { [styles.error]: errors?.photo })}
                      onChange={onChangeFile}
                      beforeUpload={() => false}
                    >
                      <div className={cs(styles.uploadBtn, { [styles.withPhoto]: !!user.photo })}>
                        {user.photo && <img src={user.photo} className={styles.photo} />}
                        <div className={styles.controls}>
                          {user.photo ? <EditOutlined size={28} /> : <PlusOutlined size={28} />}
                          <div className={styles.photoLabel}>
                            {user.photo
                              ? I18n.t('profile.change_photo')
                              : I18n.t('profile.add_photo')}
                          </div>
                        </div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={16}>
                  <Form
                    layout="vertical"
                    initialValues={user}
                    onFinish={submitForm}
                    className={styles.form}
                  >
                    <Row gutter={24}>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="firstName"
                          label={I18n.t('profile.first_name')}
                          hasFeedback
                          help={errors?.first_name}
                          validateStatus={errors?.first_name ? 'error' : ''}
                          required
                        >
                          <Input size="large" disabled={lockedFields.first_name} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="lastName"
                          label={I18n.t('profile.last_name')}
                          hasFeedback
                          help={errors?.last_name}
                          validateStatus={errors?.last_name ? 'error' : ''}
                          required
                        >
                          <Input size="large" disabled={lockedFields.last_name} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="email" label={I18n.t('profile.email')}>
                      <Input size="large" disabled />
                    </Form.Item>
                    <Row gutter={24}>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="age"
                          label={I18n.t('profile.age')}
                          help={errors?.age}
                          required={requiredFields.age}
                          validateStatus={errors?.age ? 'error' : ''}
                          rules={[{ pattern: /^\d*$/, message: I18n.t('common.validations.should_be_whole_number') }]}
                        >
                          <InputNumber
                            className={styles.numberInput}
                            size="large"
                            disabled={lockedFields.age}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="gender"
                          label={I18n.t('profile.gender')}
                          hasFeedback
                          required={requiredFields.gender}
                        >
                          <Select size="large" disabled={lockedFields.gender}>
                            <Select.Option value="male">{I18n.t('profile.male')}</Select.Option>
                            <Select.Option value="female">{I18n.t('profile.female')}</Select.Option>
                            <Select.Option value="not_disclosed">{I18n.t('profile.not_disclosed')}</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="locale"
                      label={I18n.t('profile.locale')}
                      hasFeedback
                      help={errors?.locale}
                      validateStatus={errors?.locale ? 'error' : ''}
                      required={requiredFields.locale}
                    >
                      <Select size="large" disabled={lockedFields.locale}>
                        {_.map(locales, locale => (
                          <Select.Option key={locale} value={locale}>
                            {I18n.t(`languages_localized.${locale}`)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* <Form.Item
                      name="timezone"
                      label={I18n.t('profile.timezone')}
                      hasFeedback
                      help={errors?.timezone}
                      validateStatus={errors?.timezone ? 'error' : ''}
                    >
                      <Select
                        disabled={lockedFields.timezone}
                        size="large"
                        showSearch
                        filterOption={(search, option) => `${option?.value}`
                          .toLowerCase().includes(search.toLowerCase())}
                      >
                        {timezoneNames.map((item, i) => (
                          <Select.Option key={i} value={item.zone}>
                            {item.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}
                    <Row gutter={24} className={styles.customFields}>
                      {fields.map(field => isAvailable(field) && (
                        <Col key={field.question_id} xs={24} sm={24} md={field.half_size ? 12 : 24}>
                          <Form.Item
                            hasFeedback
                            help={Array.isArray(errors?.[field.name])
                              ? array.joinJSXElements(errors?.[field.name], <br />)
                              : errors?.[field.name]}
                            validateStatus={errors?.[field.name] ? 'error' : ''}
                            name={`field_${field.question_id}`}
                            label={Utils.stripHTML(field.translations.questionText
                              || field.question.props.questionText)}
                            required={field.required}
                          >
                            <CustomField field={field} defaultValue={customFields[`field_${field.question_id}`]} />
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                    <Space align="baseline" size="middle" className={styles.buttonSpaceContainer}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className={styles.actionButton}
                      >
                        {I18n.t('profile.update')}
                        <DirectionalArrowIcon className={styles.buttonIcon} />
                      </Button>
                    </Space>
                  </Form>
                  <CropImageModal
                    show={showCropper}
                    onCrop={uploadFile}
                    onCancel={() => setShowCropper(false)}
                    image={image}
                    showControls
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Content>
    </>

  )
}

const connector = connect((state: RootState) => ({
  user: getUser(state),
  fields: state.config.profile.fields,
  lockedFields: state.config.profile.lockedFields,
  requiredFields: state.config.profile.requiredFields,
}), {
  sync,
  uploadPhoto,
})

export const Profile = connector(ProfileComponent)
