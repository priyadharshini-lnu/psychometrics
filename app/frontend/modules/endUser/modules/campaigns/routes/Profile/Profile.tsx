import {
  useState, useRef, useLayoutEffect,
  useEffect,
} from 'react'
import humps from 'humps'
import { connect } from 'react-redux'
import {
  Col, Row, Typography, Form, Upload, Input, Layout, InputNumber, Select,
  Space, Progress, Button, message,
} from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import {
  DirectionalArrowIcon, PageHeader, FontsizeModifier,
} from '~/glint'
import { PlusOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CropImageModal } from '~/glint/components/CropImageModal'
import Utils from '~/modules/reports/utils/Utils'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import {
  sync,
  get as getUser,
  uploadPhoto,
} from '~/core/currentUser'
import array from '~/utils/array'
import { CustomField } from './fields/CustomField'
import { useSetAccessibilityAttributesOnSelect } from '~/hooks/useSetAccessibilityAttributesOnSelect'

import styles from './styles.less'
import { DocumentTitle } from '~/components/DocumentTitle'

const { Text, Title } = Typography
const { I18n } = window
const locales = I18n.availableLocales
const { Content } = Layout

const languageOptions = locales.map(locale => ({
  key: locale,
  label: <span lang={locale}>{I18n.t(`languages.${locale}`)}</span>,
  value: locale,
}))

const genderOptions = [
  {
    key: 'male',
    label: I18n.t('profile.male'),
    value: 'male',
  },
  {
    key: 'female',
    label: I18n.t('profile.female'),
    value: 'female',
  },
  {
    key: 'not_disclosed',
    label: I18n.t('profile.not_disclosed'),
    value: 'not_disclosed',
  },
]

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
  TextEntry: ['SingleLine', 'Multiline', 'DateEntry'],
}

const isAvailable = ({ question }) => AVAILABLE_QUESTIONS[question.type]
  && AVAILABLE_QUESTIONS[question.type].includes(question.props.type)

function ProfileComponent ({
  user, uploadPhoto, sync, fields, lockedFields, requiredFields, enabledFields,
}) {
  const [showCropper, setShowCropper] = useState(false)
  const [image, setImage] = useState<Image | null>(null)
  const [errors, setErrors] = useState <Errors>({})
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm()
  const uploadRef = useRef<HTMLDivElement | null>(null)
  const genderSelectRef = useRef<HTMLDivElement | null>(null)
  const localeSelectRef = useRef<HTMLDivElement | null>(null)
  const selectedGender = Form.useWatch('gender', form)
  const selectedLocale = Form.useWatch('locale', form)

  useSetAccessibilityAttributesOnSelect(genderSelectRef, 'enduser_profile_gender', selectedGender)
  useSetAccessibilityAttributesOnSelect(localeSelectRef, 'enduser_profile_locale', selectedLocale)

  useEffect(() => {
    focusFirstErrorField(errors)
  }, [errors])

  useLayoutEffect(() => {
    message.config({ getContainer: () => messageContainerRef.current || document.body })

    return () => {
      message.destroy()
    }
  }, [])

  const focusFirstErrorField = (errors) => {
    const firstErrorKey = Object.keys(errors)[0]
    if (firstErrorKey === 'photo' && uploadRef.current?.parentNode) {
      const uploadButton = uploadRef.current?.parentNode as HTMLSpanElement
      // hack to make upload button focusable
      uploadButton.contentEditable = 'true'
      uploadButton.focus()
      uploadButton.contentEditable = 'false'
      return
    }
    if (firstErrorKey) {
      const fieldErrorFieldNamePath = humps.camelize(firstErrorKey)
      form.getFieldInstance(fieldErrorFieldNamePath)?.focus()
    }
  }

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

  const headerElement = (
    <Col flex="auto" span={24} className="ta-e">
      <Space>
        <FontsizeModifier />
        <LangDropdownWithChangeLocale />
      </Space>
    </Col>
  )

  return (
    <>
      <DocumentTitle text={`${I18n.t('campaign.dashboard_menu.profile')} ${I18n.t('campaign.details')}`} />
      <PageHeader>{headerElement}</PageHeader>
      <Content className={styles.pageContent}>
        <div className={styles.container}>
          {user.updateProfileRequired && (
            <Row>
              <Col span={18}>
                <Title level={5}>{I18n.t('profile.update_required')}</Title>
                <Space size="middle" orientation="vertical">
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
              <Title className={styles.profileTitle} level={1}>{I18n.t('profile.title')}</Title>
              <Row gutter={64}>
                {enabledFields.photo && (
                  <Col xs={24} sm={24} md={12} lg={8}>
                    <Form form={form}>
                      <Form.Item
                        help={errors?.photo}
                        validateStatus={errors?.photo ? 'error' : ''}
                        name="photo"
                        rules={[
                          { required: requiredFields.photo, message: I18n.t('validations.photo') },
                        ]}
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
                          <div
                            aria-labelledby="upload-photo-label"
                            tabIndex={0}
                            role="button"
                            ref={uploadRef}
                            className={cs(styles.uploadBtn, { [styles.withPhoto]: !!user.photo })}
                          >
                            {user.photo && <img src={user.photo} className={styles.photo} />}
                            <div className={styles.controls}>
                              {user.photo ? <EditOutlined size={28} /> : <PlusOutlined size={28} />}
                              <div id="upload-photo-label" className={styles.photoLabel}>
                                {user.photo
                                  ? I18n.t('profile.change_photo')
                                  : I18n.t('profile.add_photo')}
                              </div>
                            </div>
                          </div>
                        </Upload>
                      </Form.Item>
                    </Form>
                  </Col>
                )}
                <Col xs={24} sm={24} md={12} lg={16}>
                  <div className="fs-14 mb-4">
                    <span aria-hidden className={styles.requiredMark} />
                    <span>{I18n.t('profile.mandatory_fields')}</span>
                  </div>
                  <Form
                    layout="vertical"
                    initialValues={user}
                    onFinish={submitForm}
                    className={styles.form}
                    form={form}
                    requiredMark={(label, { required }) => (
                      <>
                        {required && <span aria-hidden className={styles.requiredMark} />}
                        {label}
                      </>
                    )}
                  >
                    <Row gutter={24}>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="firstName"
                          label={I18n.t('profile.first_name')}
                          hasFeedback
                          help={errors?.first_name}
                          validateStatus={errors?.first_name ? 'error' : ''}
                          rules={[
                            { required: true, message: I18n.t('validations.required') },
                          ]}
                        >
                          <Input autoComplete="tte-profile-firstname" size="large" disabled={lockedFields.first_name} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="lastName"
                          label={I18n.t('profile.last_name')}
                          hasFeedback
                          help={errors?.last_name}
                          validateStatus={errors?.last_name ? 'error' : ''}
                          rules={[
                            { required: true, message: I18n.t('validations.required') },
                          ]}
                        >
                          <Input autoComplete="tte-profile-lastname" size="large" disabled={lockedFields.last_name} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="email" label={I18n.t('profile.email')}>
                      <Input size="large" disabled autoComplete="tte-profile-email" />
                    </Form.Item>
                    <Row gutter={24}>
                      {enabledFields.age && (
                        <Col xs={24} sm={24} md={12}>
                          <Form.Item
                            name="age"
                            label={I18n.t('profile.age')}
                            help={errors?.age}
                            validateStatus={errors?.age ? 'error' : ''}
                            rules={[{ pattern: /^\d*$/, message: I18n.t('common.validations.should_be_whole_number') },
                              { required: requiredFields.age, message: I18n.t('validations.required') }]}
                          >
                            <InputNumber
                              className={styles.numberInput}
                              size="large"
                              disabled={lockedFields.age}
                              controls={false}
                            />
                          </Form.Item>
                        </Col>
                      )}
                      {enabledFields.gender && (
                        <Col xs={24} sm={24} md={12} ref={genderSelectRef}>
                          <Form.Item
                            name="gender"
                            label={I18n.t('profile.gender')}
                            hasFeedback
                            rules={[
                              { required: requiredFields.gender, message: I18n.t('validations.required') },
                            ]}
                          >
                            <Select
                              options={genderOptions}
                              showSearch={false}
                              size="large"
                              disabled={lockedFields.gender}
                              virtual={false} // this is to make Select component accessibility compatible
                            />
                          </Form.Item>
                        </Col>
                      )}
                    </Row>
                    <div ref={localeSelectRef}>
                      <Form.Item
                        name="locale"
                        label={I18n.t('profile.locale')}
                        hasFeedback
                        help={errors?.locale}
                        validateStatus={errors?.locale ? 'error' : ''}
                        rules={[
                          { required: requiredFields.locale, message: I18n.t('validations.required') },
                        ]}
                      >
                        <Select
                          virtual={false} // this is to make Select component accessibility compatible
                          options={languageOptions}
                          size="large"
                          disabled={lockedFields.locale}
                        />
                      </Form.Item>
                    </div>
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
                            rules={[
                              { required: field.required, message: I18n.t('validations.required') },
                            ]}
                            label={Utils.stripHTML(field.translations.questionText
                              || field.question.props.questionText)}
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
        <div aria-live="polite" ref={messageContainerRef} />
      </Content>
    </>

  )
}

const connector = connect((state: RootState) => ({
  user: getUser(state),
  fields: state.config.profile.fields,
  lockedFields: state.config.profile.lockedFields,
  requiredFields: state.config.profile.requiredFields,
  enabledFields: state.config.profile.enabledFields,
}), {
  sync,
  uploadPhoto,
})

export const Profile = connector(ProfileComponent)
