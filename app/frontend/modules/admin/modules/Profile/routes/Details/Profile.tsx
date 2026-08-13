import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import {
  Col, Row, Typography, Form, Upload, Input, Select, Layout, Space, Button, App,
} from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import { PlusOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { camelizeKeys } from '~/utils/object'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentUser, uploadAdminUserPhoto,
} from '~/core/currentUser'
import { CropImageModal } from '~/glint/components/CropImageModal'


import styles from './styles.less'
import { UserTR, User, UserProfile } from '~/modules/admin/modules/client/core/users'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { useTimezones } from '~/hooks/useTimezones'

const { Title } = Typography
const { I18n } = window
const { Content } = Layout

interface Image {
  type?: string
  src: string
}

interface JSONApiError {
  title: string
  detail?: string
}

interface Errors {
  firstName?: JSONApiError
  lastName?: JSONApiError
  locale?: JSONApiError
  timezone?: JSONApiError
}


interface AdminUser extends User{
  userProfileData: UserProfile,
  userProfile: UserProfile,
}

function Profile ({
  currentUser, uploadPhoto, locales,
}) {
  useEffect(() => {
    fetchSingle({ id: currentUser.id })
  }, [currentUser.id])


  const [showCropper, setShowCropper] = useState(false)
  const [image, setImage] = useState<Image | null>(null)
  const { message } = App.useApp()
  const timezoneOptions = useTimezones()

  const {
    fetchSingle, getResource, updateResource, isLoading,
  } = useResources<AdminUser>('users', {
    responseType: UserTR,
    apiConfig: {
      camelizeExcept: ['$[*].enable_2fa', '$.enable_2fa'],
      include_resource_meta: ['permissions'],
      include: ['user_profile'],
    },
  })
  const profileUpdateInProgress = isLoading(`update@${currentUser.id}`)

  const [errors, setErrors] = useState<Errors | null>(null)

  const user = getResource(currentUser.id.toString())
  if (!user) return null
  const uploadFile = (canvas) => {
    if (canvas) {
      const form = new FormData()
      canvas.toBlob((blob) => {
        if (blob) {
          form.append('photo', blob, 'file.jpg')
          uploadPhoto(form).then(() => {
            setShowCropper(false)
          }).then(() => {
            fetchSingle({ id: currentUser.id })
          })
        }
      }, 'image/jpg')
    }
  }

  const submitForm = (values) => {
    updateResource({
      id: currentUser.id,
      firstName: values.firstName,
      lastName: values.lastName,
      userProfileData: {
        locale: values.locale,
        timezone: values.timezone,
      },
    }).then(() => {
      message.success(I18n.t('profile.success_update'), 5)
    }).catch((e) => {
      setErrors(e.errors || e)
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

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin/profile',
            label: () => I18n.t('admin.profile'),
          },
          {
            label: () => I18n.t('admin.profile_details'),
          },
        ]}
      />
      <Content className={styles.pageContent}>
        <div className={styles.container}>
          <Row gutter={[32, 32]}>
            <Col span={24}>
              <Title level={3}>{I18n.t('profile.title')}</Title>
              <Row gutter={32}>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item>
                    <Upload
                      listType="picture-card"
                      accept=".jpg, .jpeg, |image/*"
                      showUploadList={false}
                      maxCount={1}
                      className={styles.upload}
                      onChange={onChangeFile}
                      beforeUpload={() => false}
                    >
                      <div
                        aria-labelledby="upload-photo-label"
                        tabIndex={0}
                        role="button"
                        className={cs(styles.uploadBtn, { [styles.withPhoto]: !!user.photoUrl }, 'h-100')}
                      >
                        {user.photoUrl && (
                          <img
                            src={user.photoUrl}
                            alt={user.photoUrl
                              ? I18n.t('profile.change_photo')
                              : I18n.t('profile.add_photo')}
                            className={styles.photo}
                          />
                        )}
                        <div id="upload-photo-label" className={styles.controls}>
                          {user.photoUrl ? <EditOutlined size={28} /> : <PlusOutlined size={28} />}
                          <div className={styles.photoLabel}>
                            {user.photoUrl
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
                    initialValues={{
                      firstName: user.firstName,
                      lastName: user.lastName,
                      locale: user.userProfile?.locale,
                      timezone: user.userProfile?.timezone,
                      email: user.email,
                    }}
                    onFinish={submitForm}
                    className={styles.form}
                  >
                    <Row gutter={24}>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="firstName"
                          label={I18n.t('shared.first_name')}
                          hasFeedback
                          help={errors?.firstName?.title}
                          validateStatus={errors?.firstName ? 'error' : ''}
                          required
                        >
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          name="lastName"
                          label={I18n.t('shared.last_name')}
                          hasFeedback
                          help={errors?.lastName?.title}
                          validateStatus={errors?.lastName ? 'error' : ''}
                          required
                        >
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="email" label={I18n.t('shared.email')}>
                      <Input size="large" disabled />
                    </Form.Item>
                    <Form.Item
                      name="locale"
                      label={I18n.t('profile.locale')}
                      hasFeedback
                      help={errors?.locale?.title}
                      validateStatus={errors?.locale ? 'error' : ''}
                    >
                      <Select
                        size="large"
                        showSearch
                        filterOption={(search, option) => I18n.t(`languages.${option?.value}`)
                          .toLowerCase().includes(search.toLowerCase())}
                      >
                        {_.map(locales, locale => (
                          <Select.Option key={locale} value={locale}>
                            {I18n.t(`languages.${locale}`)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="timezone"
                      label={I18n.t('profile.timezone')}
                      hasFeedback
                      help={errors?.timezone?.title}
                      validateStatus={errors?.timezone ? 'error' : ''}
                    >
                      <Select
                        size="large"
                        showSearch
                        options={timezoneOptions}
                        filterOption={(search, option) => `${option?.value}`
                          .toLowerCase().includes(search.toLowerCase())}
                      />
                    </Form.Item>
                    <Space align="baseline" size="middle" className={styles.buttonSpaceContainer}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className={styles.actionButton}
                        loading={profileUpdateInProgress}
                      >
                        {I18n.t('shared.update')}
                      </Button>
                    </Space>
                  </Form>
                  <CropImageModal
                    show={showCropper}
                    onCrop={uploadFile}
                    onCancel={() => setShowCropper(false)}
                    image={image}
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
  currentUser: camelizeKeys(getCurrentUser(state)),
  locales: state.config.availableLocales,
}), {
  uploadPhoto: uploadAdminUserPhoto,
})

export default connector(Profile)
