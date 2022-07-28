import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
  Col, Row, Typography, Form, Upload, Input, Select, message, Checkbox, Layout,
} from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import moment from 'moment-timezone'
import cs from 'classnames'

import { PageHeader } from 'glint'
import { ButtonWithArrow } from 'glint/components/ButtonWithArrow'
import LangDropdown from 'components/LangDropdown'

import {
  sync,
  get as getUser,
  uploadPhoto,
} from 'core/currentUser'
import { CropperModal } from './CropperModal'

import styles from './styles.less'

const { Title } = Typography
const { I18n } = window
const locales = I18n.availableLocales
const current = I18n.locale
const { Content } = Layout

const timeZones = moment.tz.names()

interface Image {
  type?: string
  src: string
}
interface Errors {
  password?: []
  passwordConfirmation?: []
}

function ProfileComponent ({ user, uploadPhoto, sync }) {
  const [changePassword, setChangePassword] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [image, setImage] = useState<Image | null>(null)
  const [errors, setErrors] = useState <Errors>({})

  const uploadFile = (canvas) => {
    if (canvas) {
      const form = new FormData()
      canvas.toBlob((blob) => {
        if (blob) {
          form.append('photo', blob, 'file.png')
          uploadPhoto(form).then(() => {
            setShowCropper(false)
          })
        }
      }, 'image/png')
    }
  }

  const submitForm = (values) => {
    sync(values)
      .then(() => {
        message.success(I18n.t('profile.success_update'), 5)
        setChangePassword(false)
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
      <LangDropdown locales={locales} current={current} />
    </Col>
  )

  return (
    <>
      <PageHeader>{headerElement}</PageHeader>
      <Content className={styles.pageContent}>
        <div className={styles.container}>
          <Row gutter={[32, 32]}>
            <Col span={24}>
              <Title level={3}>{I18n.t('profile.title')}</Title>
              <Row gutter={64}>
                <Col span={8}>
                  <Form.Item>
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      maxCount={1}
                      className={styles.upload}
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
                <Col span={16}>
                  <Form
                    layout="vertical"
                    initialValues={user}
                    onFinish={submitForm}
                    className={styles.form}
                  >
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item name="firstName" label={I18n.t('profile.first_name')}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="lastName" label={I18n.t('profile.last_name')}>
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="email" label={I18n.t('profile.email')}>
                      <Input size="large" disabled />
                    </Form.Item>
                    <Form.Item name="timezone" label={I18n.t('profile.timezone')}>
                      <Select
                        size="large"
                        showSearch
                        filterOption={(search, option) => `${option?.value}`
                          .toLowerCase().includes(search.toLowerCase())}
                      >
                        {timeZones.map((zone, i) => (
                          <Select.Option key={i} value={zone}>
                            {`(GMT${moment.tz(zone).format('Z')}) ${zone}`}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Checkbox
                      checked={changePassword}
                      onChange={({ target }) => setChangePassword(target.checked)}
                    >
                      {I18n.t('profile.change_password')}
                    </Checkbox>
                    {changePassword && (
                      <>
                        <Form.Item
                          hasFeedback
                          help={errors.password}
                          validateStatus={errors.password ? 'error' : ''}
                          name="password"
                          label={I18n.t('profile.password')}
                        >
                          <Input type="password" />
                        </Form.Item>
                        <Form.Item
                          name="passwordConfirmation"
                          help={errors.passwordConfirmation}
                          validateStatus={errors.passwordConfirmation ? 'error' : ''}
                          label={I18n.t('profile.password_confirmation')}
                        >
                          <Input type="password" />
                        </Form.Item>
                      </>
                    )}
                    <ButtonWithArrow
                      label={I18n.t('profile.update')}
                      type="primary"
                      htmlType="submit"
                      className={styles.submit}
                    />
                  </Form>
                  <CropperModal
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

const connector = connect(state => ({
  user: getUser(state),
}), {
  sync,
  uploadPhoto,
})

export const Profile = connector(ProfileComponent)
